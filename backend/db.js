import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/easylab';
const DATA_DIR = path.join(__dirname, 'data');
const JSON_DB_PATH = path.join(DATA_DIR, 'db.json');

let isMongoConnected = false;

// 1. Mongoose Schema definitions
const TestSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const BookingSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  selectedTest: { type: String, required: true },
  preferredDate: { type: Date, required: true },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

const TestModel = mongoose.model('Test', TestSchema);
const BookingModel = mongoose.model('Booking', BookingSchema);

// Helper for generating custom IDs for file fallback
function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Ensure local JSON DB directory and file exist with initial data
function initJsonDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(JSON_DB_PATH)) {
    const initialData = {
      tests: [
        { _id: 't_cbc', name: 'CBC', createdAt: new Date().toISOString() },
        { _id: 't_sugar', name: 'Blood Sugar', createdAt: new Date().toISOString() },
        { _id: 't_thyroid', name: 'Thyroid Profile', createdAt: new Date().toISOString() },
        { _id: 't_vitd', name: 'Vitamin D', createdAt: new Date().toISOString() },
        { _id: 't_lipid', name: 'Lipid Profile', createdAt: new Date().toISOString() }
      ],
      bookings: []
    };
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

// Read JSON DB
function readJsonDb() {
  initJsonDb();
  try {
    const data = fs.readFileSync(JSON_DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading JSON db, resetting", err);
    return { tests: [], bookings: [] };
  }
}

// Write JSON DB
function writeJsonDb(data) {
  fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Connect to MongoDB
export async function connectDB() {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    // Connect with a short timeout so it fails fast if not running
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 3000
    });
    isMongoConnected = true;
    console.log("MongoDB connected successfully.");
    
    // Seed default tests in MongoDB if empty
    const testCount = await TestModel.countDocuments();
    if (testCount === 0) {
      console.log("Seeding default tests in MongoDB...");
      await TestModel.insertMany([
        { name: 'CBC' },
        { name: 'Blood Sugar' },
        { name: 'Thyroid Profile' },
        { name: 'Vitamin D' },
        { name: 'Lipid Profile' }
      ]);
    }
  } catch (err) {
    console.warn("MongoDB connection failed. Falling back to local JSON database.");
    isMongoConnected = false;
    initJsonDb();
  }
}

// Db operations wrapper
export const db = {
  isFallback: () => !isMongoConnected,

  tests: {
    find: async () => {
      if (isMongoConnected) {
        return await TestModel.find({}).sort({ name: 1 });
      } else {
        const data = readJsonDb();
        return data.tests.sort((a, b) => a.name.localeCompare(b.name));
      }
    },
    create: async (testData) => {
      if (isMongoConnected) {
        return await TestModel.create(testData);
      } else {
        const data = readJsonDb();
        // Check duplicate
        if (data.tests.some(t => t.name.toLowerCase() === testData.name.toLowerCase())) {
          throw new Error("Test already exists");
        }
        const newTest = {
          _id: generateId(),
          name: testData.name,
          createdAt: new Date().toISOString()
        };
        data.tests.push(newTest);
        writeJsonDb(data);
        return newTest;
      }
    },
    deleteOne: async (id) => {
      if (isMongoConnected) {
        return await TestModel.deleteOne({ _id: id });
      } else {
        const data = readJsonDb();
        const initialLength = data.tests.length;
        data.tests = data.tests.filter(t => t._id !== id);
        writeJsonDb(data);
        return { deletedCount: initialLength - data.tests.length };
      }
    }
  },

  bookings: {
    find: async () => {
      if (isMongoConnected) {
        return await BookingModel.find({}).sort({ createdAt: -1 });
      } else {
        const data = readJsonDb();
        return data.bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    },
    create: async (bookingData) => {
      if (isMongoConnected) {
        return await BookingModel.create(bookingData);
      } else {
        const data = readJsonDb();
        const newBooking = {
          _id: generateId(),
          patientName: bookingData.patientName,
          phoneNumber: bookingData.phoneNumber,
          address: bookingData.address,
          selectedTest: bookingData.selectedTest,
          preferredDate: bookingData.preferredDate,
          status: 'Pending',
          createdAt: new Date().toISOString()
        };
        data.bookings.push(newBooking);
        writeJsonDb(data);
        return newBooking;
      }
    },
    findByIdAndUpdate: async (id, updateData) => {
      if (isMongoConnected) {
        return await BookingModel.findByIdAndUpdate(id, updateData, { new: true });
      } else {
        const data = readJsonDb();
        const bookingIndex = data.bookings.findIndex(b => b._id === id);
        if (bookingIndex !== -1) {
          data.bookings[bookingIndex] = {
            ...data.bookings[bookingIndex],
            ...updateData
          };
          writeJsonDb(data);
          return data.bookings[bookingIndex];
        }
        return null;
      }
    },
    deleteOne: async (id) => {
      if (isMongoConnected) {
        return await BookingModel.deleteOne({ _id: id });
      } else {
        const data = readJsonDb();
        const initialLength = data.bookings.length;
        data.bookings = data.bookings.filter(b => b._id !== id);
        writeJsonDb(data);
        return { deletedCount: initialLength - data.bookings.length };
      }
    }
  }
};
