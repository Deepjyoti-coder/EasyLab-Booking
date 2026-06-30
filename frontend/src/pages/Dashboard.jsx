import React, { useState, useEffect } from 'react';
import { Search, Filter, Trash2, CheckCircle2, UserCheck, Calendar, Phone, MapPin, RefreshCw, RefreshCw as SpinnerIcon } from 'lucide-react';
import Modal from '../components/Modal';

export default function Dashboard({ backendUrl }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Poll for bookings every 5 seconds to load new bookings automatically
  useEffect(() => {
    fetchBookings(true);
    const interval = setInterval(() => {
      fetchBookings(false); // background fetch (no full page loading spinner)
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchBookings = async (showLoadingSpinner = false) => {
    try {
      if (showLoadingSpinner) setLoading(true);
      const res = await fetch(`${backendUrl}/api/bookings`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error("Error loading bookings:", err);
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      const res = await fetch(`${backendUrl}/api/bookings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        // Update local state
        setBookings(prev => prev.map(b => b._id === id ? { ...b, status: newStatus } : b));
      }
    } catch (err) {
      console.error("Error updating booking:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const initiateDelete = (booking) => {
    setBookingToDelete(booking);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bookingToDelete) return;
    try {
      const res = await fetch(`${backendUrl}/api/bookings/${bookingToDelete._id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setBookings(prev => prev.filter(b => b._id !== bookingToDelete._id));
      }
    } catch (err) {
      console.error("Error deleting booking:", err);
    } finally {
      setDeleteModalOpen(false);
      setBookingToDelete(null);
    }
  };

  // Filter and search bookings
  const filteredBookings = bookings.filter(b => {
    const nameMatch = b.patientName.toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = b.phoneNumber.includes(searchQuery);
    const matchesSearch = nameMatch || phoneMatch;

    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">Pending</span>;
      case 'Assigned':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">Assigned</span>;
      case 'Completed':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-success-50 text-success-700 border border-success-100">Completed</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const formatTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Title & Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Front Desk Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm">View, assign, and manage incoming patient bookings.</p>
        </div>
        <button
          onClick={() => fetchBookings(true)}
          className="btn-secondary text-sm py-2 px-4 flex items-center gap-2 cursor-pointer shadow-sm hover:border-slate-300"
        >
          <RefreshCw className="h-4 w-4 text-slate-500" />
          <span>Refresh Bookings</span>
        </button>
      </div>

      {/* Filters and Search Control */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 mb-6 flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-64 flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Bookings Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <SpinnerIcon className="h-10 w-10 animate-spin text-primary-500 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">Loading bookings database...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="bg-slate-50 text-slate-400 p-4 rounded-full inline-flex mb-4">
              <Calendar className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No Bookings Found</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              {bookings.length === 0 
                ? "There are no collection bookings in the database yet." 
                : "No bookings match your search query or status filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Booking ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Patient & Phone</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Collection Address</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Selected Test</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Preferred Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Booking Time</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((booking, idx) => (
                  <tr key={booking._id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Booking ID */}
                    <td className="px-6 py-4 text-sm font-semibold text-slate-400">
                      #{booking._id.substring(booking._id.length - 6).toUpperCase()}
                    </td>
                    
                    {/* Patient & Phone */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-800 block">{booking.patientName}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" />
                        {booking.phoneNumber}
                      </span>
                    </td>
                    
                    {/* Collection Address */}
                    <td className="px-6 py-4 max-w-xs">
                      <span className="text-sm text-slate-600 block line-clamp-2" title={booking.address}>
                        {booking.address}
                      </span>
                    </td>
                    
                    {/* Selected Test */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-primary-50 text-primary-700">
                        {booking.selectedTest}
                      </span>
                    </td>
                    
                    {/* Preferred Date */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-700 block">{formatDate(booking.preferredDate)}</span>
                    </td>
                    
                    {/* Booking Time */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 block">{formatDate(booking.createdAt)}</span>
                      <span className="text-xs text-slate-400 mt-0.5 block">{formatTime(booking.createdAt)}</span>
                    </td>
                    
                    {/* Status */}
                    <td className="px-6 py-4">
                      {getStatusBadge(booking.status)}
                    </td>
                    
                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {booking.status === 'Pending' && (
                          <button
                            onClick={() => handleUpdateStatus(booking._id, 'Assigned')}
                            disabled={updatingId === booking._id}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Mark as Assigned"
                          >
                            <UserCheck className="h-5 w-5" />
                          </button>
                        )}
                        
                        {(booking.status === 'Pending' || booking.status === 'Assigned') && (
                          <button
                            onClick={() => handleUpdateStatus(booking._id, 'Completed')}
                            disabled={updatingId === booking._id}
                            className="p-1.5 rounded-lg text-success-600 hover:bg-success-50 transition-colors cursor-pointer"
                            title="Mark as Completed"
                          >
                            <CheckCircle2 className="h-5 w-5" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => initiateDelete(booking)}
                          disabled={updatingId === booking._id}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Booking"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        type="confirm"
        title="Delete Booking"
        message={`Are you sure you want to delete the booking for ${bookingToDelete?.patientName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalOpen(false);
          setBookingToDelete(null);
        }}
      />
    </div>
  );
}
