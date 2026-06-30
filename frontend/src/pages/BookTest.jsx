import React, { useState, useEffect } from 'react';
import { CalendarRange, User, Phone, MapPin, Layers, Loader2 } from 'lucide-react';
import Modal from '../components/Modal';

export default function BookTest({ backendUrl }) {
  const [tests, setTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [formData, setFormData] = useState({
    patientName: '',
    phoneNumber: '',
    address: '',
    selectedTest: '',
    preferredDate: ''
  });
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Get local today date string (YYYY-MM-DD)
  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoadingTests(true);
      const res = await fetch(`${backendUrl}/api/tests`);
      if (res.ok) {
        const data = await res.json();
        setTests(data);
      }
    } catch (err) {
      console.error("Error loading tests:", err);
    } finally {
      setLoadingTests(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for field when typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const { patientName, phoneNumber, address, selectedTest, preferredDate } = formData;

    if (!patientName.trim()) {
      newErrors.patientName = "Full Name is required";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone Number is required";
    } else if (!/^\d+$/.test(phoneNumber.trim())) {
      newErrors.phoneNumber = "Phone number must contain only valid digits";
    }

    if (!address.trim()) {
      newErrors.address = "Full Address is required";
    }

    if (!selectedTest) {
      newErrors.selectedTest = "Please select a diagnostic test";
    }

    if (!preferredDate) {
      newErrors.preferredDate = "Preferred collection date is required";
    } else {
      const selected = new Date(preferredDate);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (selected < today) {
        newErrors.preferredDate = "Date cannot be earlier than today";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const res = await fetch(`${backendUrl}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setShowSuccess(true);
        // Reset form
        setFormData({
          patientName: '',
          phoneNumber: '',
          address: '',
          selectedTest: '',
          preferredDate: ''
        });
      } else {
        setErrors({ submit: data.error || "Failed to submit booking. Please try again." });
      }
    } catch (err) {
      console.error("Booking submit error:", err);
      setErrors({ submit: "Network error. Please check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 flex items-center justify-center">
      <div className="max-w-xl w-full">
        <div className="card shadow-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-primary-50 text-primary-600 p-3.5 rounded-2xl inline-flex mb-4">
              <CalendarRange className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Book Home Sample Collection</h2>
            <p className="text-slate-500 mt-1.5 text-sm">Fill in the details below to request a collection phlebotomist.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <div className="bg-red-50 text-red-600 text-sm font-medium p-3 rounded-lg border border-red-100">
                {errors.submit}
              </div>
            )}

            {/* Patient Name */}
            <div>
              <label htmlFor="patientName" className="label-field flex items-center gap-1.5">
                <User className="h-4 w-4 text-slate-400" />
                Full Name
              </label>
              <input
                type="text"
                id="patientName"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g. John Doe"
                disabled={submitting}
              />
              {errors.patientName && <span className="text-red-500 text-xs font-semibold mt-1 block">{errors.patientName}</span>}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="label-field flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-slate-400" />
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g. 9876543210"
                disabled={submitting}
              />
              {errors.phoneNumber && <span className="text-red-500 text-xs font-semibold mt-1 block">{errors.phoneNumber}</span>}
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="label-field flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-slate-400" />
                Full Address
              </label>
              <textarea
                id="address"
                name="address"
                rows="3"
                value={formData.address}
                onChange={handleInputChange}
                className="input-field py-2.5 resize-none"
                placeholder="Enter your complete home address with landmark"
                disabled={submitting}
              ></textarea>
              {errors.address && <span className="text-red-500 text-xs font-semibold mt-1 block">{errors.address}</span>}
            </div>

            {/* Select Test */}
            <div>
              <label htmlFor="selectedTest" className="label-field flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-slate-400" />
                Select Test
              </label>
              {loadingTests ? (
                <div className="flex items-center gap-2 py-3 px-4 border border-slate-200 rounded-lg text-slate-400 bg-white">
                  <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                  <span>Loading available tests...</span>
                </div>
              ) : (
                <select
                  id="selectedTest"
                  name="selectedTest"
                  value={formData.selectedTest}
                  onChange={handleInputChange}
                  className="input-field"
                  disabled={submitting}
                >
                  <option value="">-- Choose Diagnostic Test --</option>
                  {tests.map(test => (
                    <option key={test._id} value={test.name}>
                      {test.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.selectedTest && <span className="text-red-500 text-xs font-semibold mt-1 block">{errors.selectedTest}</span>}
            </div>

            {/* Preferred Date */}
            <div>
              <label htmlFor="preferredDate" className="label-field flex items-center gap-1.5">
                <CalendarRange className="h-4 w-4 text-slate-400" />
                Preferred Collection Date
              </label>
              <input
                type="date"
                id="preferredDate"
                name="preferredDate"
                min={getTodayString()}
                value={formData.preferredDate}
                onChange={handleInputChange}
                className="input-field cursor-pointer"
                disabled={submitting}
              />
              {errors.preferredDate && <span className="text-red-500 text-xs font-semibold mt-1 block">{errors.preferredDate}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Submitting booking...</span>
                </>
              ) : (
                <span>Submit Booking</span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccess}
        type="success"
        title="Booking Successful!"
        message="Your booking has been submitted successfully. Our team will contact you soon."
        onConfirm={() => setShowSuccess(false)}
      />
    </div>
  );
}
