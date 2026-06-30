import React, { useState } from 'react';
import { LogIn, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function Login({ backendUrl, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const res = await fetch(`${backendUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        onLoginSuccess(data.token);
      } else {
        setError(data.error || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 py-16 px-4 bg-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="card shadow-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-primary-50 text-primary-600 p-3.5 rounded-2xl inline-flex mb-4">
              <LogIn className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Admin Sign In</h2>
            <p className="text-slate-500 mt-1.5 text-sm">Access the dashboard and test management panel.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm font-medium p-3 rounded-lg border border-red-100 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="label-field flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-slate-400" />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="admin@sunitalab.com"
                disabled={submitting}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="label-field flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-slate-400" />
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                disabled={submitting}
              />
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
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Demo Info Box */}
          <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50/50 p-4 rounded-xl">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Demo Credentials</span>
            <div className="text-sm text-slate-600 space-y-1">
              <p><strong className="text-slate-700">Email:</strong> admin@sunitalab.com</p>
              <p><strong className="text-slate-700">Password:</strong> Lab@1234</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
