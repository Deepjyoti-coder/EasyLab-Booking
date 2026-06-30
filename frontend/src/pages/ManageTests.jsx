import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Layers, AlertCircle, Loader2 } from 'lucide-react';
import Modal from '../components/Modal';

export default function ManageTests({ backendUrl }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTestName, setNewTestName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backendUrl}/api/tests`);
      if (res.ok) {
        const data = await res.json();
        setTests(data);
      }
    } catch (err) {
      console.error("Error fetching tests:", err);
      setError("Failed to load test list.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTest = async (e) => {
    e.preventDefault();
    if (!newTestName.trim()) {
      setError("Test name cannot be empty.");
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await fetch(`${backendUrl}/api/tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newTestName })
      });

      const data = await res.json();

      if (res.ok) {
        setTests(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
        setNewTestName('');
      } else {
        setError(data.error || "Failed to add test.");
      }
    } catch (err) {
      console.error("Error adding test:", err);
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const initiateDelete = (test) => {
    setTestToDelete(test);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!testToDelete) return;

    try {
      setError('');
      const res = await fetch(`${backendUrl}/api/tests/${testToDelete._id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setTests(prev => prev.filter(t => t._id !== testToDelete._id));
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete test.");
      }
    } catch (err) {
      console.error("Error deleting test:", err);
      setError("Network error. Please try again.");
    } finally {
      setDeleteModalOpen(false);
      setTestToDelete(null);
    }
  };

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Manage Diagnostics</h1>
        <p className="text-slate-500 mt-1 text-sm">Add or remove tests offered by Sunita Lab. Changes reflect instantly on the patient booking page.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Add Test Form */}
        <div className="md:col-span-1">
          <div className="card shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary-600" />
              <span>Add New Test</span>
            </h2>

            <form onSubmit={handleAddTest} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-lg border border-red-100 flex items-center gap-1.5">
                  <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="testName" className="label-field">Test Name</label>
                <input
                  type="text"
                  id="testName"
                  value={newTestName}
                  onChange={(e) => setNewTestName(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Thyroid Profile"
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-sm"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <Plus className="h-4.5 w-4.5" />
                )}
                <span>Add Test</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Tests List */}
        <div className="md:col-span-2">
          <div className="card shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Available Diagnostics List</h2>
            
            {loading ? (
              <div className="py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Loading test catalogue...</p>
              </div>
            ) : tests.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Layers className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                <p>No tests found in the database. Add one on the left.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-2">
                {tests.map((test) => (
                  <div key={test._id} className="flex justify-between items-center py-3.5 hover:bg-slate-50/50 transition-colors px-2 rounded-lg">
                    <span className="font-semibold text-slate-700 text-sm sm:text-base">{test.name}</span>
                    <button
                      onClick={() => initiateDelete(test)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer"
                      title="Remove Test"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        type="confirm"
        title="Remove Diagnostic Test"
        message={`Are you sure you want to remove the test "${testToDelete?.name}"? It will immediately disappear from the patient booking dropdown.`}
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalOpen(false);
          setTestToDelete(null);
        }}
      />
    </div>
  );
}
