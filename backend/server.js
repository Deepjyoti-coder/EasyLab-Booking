import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Health check & DB status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    database: db.isFallback() ? 'local-json' : 'mongodb'
  });
});

// 2. Test Endpoints
app.get('/api/tests', async (req, res) => {
  try {
    const tests = await db.tests.find();
    res.json(tests);
  } catch (err) {
    console.error("Error fetching tests:", err);
    res.status(500).json({ error: "Failed to fetch tests" });
  }
});

app.post('/api/tests', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: "Test name is required" });
    }
    const newTest = await db.tests.create({ name: name.trim() });
    res.status(201).json(newTest);
  } catch (err) {
    console.error("Error creating test:", err);
    if (err.message === "Test already exists" || err.code === 11000) {
      return res.status(400).json({ error: "Test already exists" });
    }
    res.status(500).json({ error: "Failed to add test" });
  }
});

app.delete('/api/tests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.tests.deleteOne(id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Test not found" });
    }
    res.json({ success: true, message: "Test removed successfully" });
  } catch (err) {
    console.error("Error deleting test:", err);
    res.status(500).json({ error: "Failed to delete test" });
  }
});

// 3. Booking Endpoints
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await db.bookings.find();
    res.json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { patientName, phoneNumber, address, selectedTest, preferredDate } = req.body;

    // Field presence validation
    if (!patientName || !phoneNumber || !address || !selectedTest || !preferredDate) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const trimmedName = patientName.trim();
    const trimmedPhone = phoneNumber.trim();
    const trimmedAddress = address.trim();

    if (!trimmedName || !trimmedPhone || !trimmedAddress || !selectedTest) {
      return res.status(400).json({ error: "All fields are required and cannot be empty" });
    }

    // Phone digits validation
    if (!/^\d+$/.test(trimmedPhone)) {
      return res.status(400).json({ error: "Phone number must contain only valid digits" });
    }

    // Date validation: preferred date cannot be earlier than today (local date check)
    const prefDate = new Date(preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(prefDate.getTime())) {
      return res.status(400).json({ error: "Invalid preferred collection date" });
    }

    if (prefDate < today) {
      return res.status(400).json({ error: "Date cannot be earlier than today" });
    }

    const newBooking = await db.bookings.create({
      patientName: trimmedName,
      phoneNumber: trimmedPhone,
      address: trimmedAddress,
      selectedTest,
      preferredDate: prefDate.toISOString(),
      status: 'Pending'
    });

    res.status(201).json(newBooking);
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ error: "Failed to submit booking" });
  }
});

app.patch('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['Pending', 'Assigned', 'Completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be Pending, Assigned, or Completed." });
    }

    const updatedBooking = await db.bookings.findByIdAndUpdate(id, { status });
    if (!updatedBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(updatedBooking);
  } catch (err) {
    console.error("Error updating booking status:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.bookings.deleteOne(id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json({ success: true, message: "Booking deleted successfully" });
  } catch (err) {
    console.error("Error deleting booking:", err);
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

// 4. Admin Sign-In Endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (email.trim().toLowerCase() === 'admin@sunitalab.com' && password === 'Lab@1234') {
    return res.json({
      success: true,
      token: 'admin-session-token-mvp',
      user: {
        email: 'admin@sunitalab.com',
        role: 'admin'
      }
    });
  }

  return res.status(401).json({ error: "Invalid email or password" });
});

// 5. Serve static files in production if built
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));
app.get('*', (req, res, next) => {
  // If request is for an API endpoint, skip to 404
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) {
      // In development or if frontend isn't built yet, return a simple text message
      res.status(200).send("API server is running. Frontend build is not available yet.");
    }
  });
});

// Start the server
async function startServer() {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Mode: ${db.isFallback() ? 'LOCAL-JSON-FILE' : 'MONGO-DB-MAPPED'}`);
  });
}

startServer();
