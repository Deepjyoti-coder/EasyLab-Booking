import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export default function Modal({ isOpen, type = 'success', title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={type === 'success' ? onConfirm : onCancel}
      ></div>

      {/* Modal Box */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 relative z-10 transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button (only for success info modals) */}
        {type === 'success' && (
          <button 
            onClick={onConfirm} 
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="flex flex-col items-center text-center mt-2">
          {/* Icon */}
          {type === 'success' ? (
            <div className="bg-success-50 p-3 rounded-2xl text-success-500 mb-4 animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
          ) : (
            <div className="bg-red-50 p-3 rounded-2xl text-red-500 mb-4">
              <AlertCircle className="h-10 w-10" />
            </div>
          )}

          {/* Title */}
          <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
          
          {/* Message */}
          <p className="text-sm text-slate-500 leading-relaxed mb-6">{message}</p>

          {/* Action Buttons */}
          <div className="flex w-full gap-3">
            {type === 'confirm' ? (
              <>
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer shadow-sm"
                >
                  {confirmText}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onConfirm}
                className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-colors cursor-pointer shadow-sm"
              >
                Okay
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
