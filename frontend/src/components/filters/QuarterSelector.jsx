import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { formatQuarter } from '../../utils/formatters';
import toast from 'react-hot-toast';

function QuarterSelector() {
  const { quarters, selectedQuarter, setSelectedQuarter, selectedFund, loading, deleteQuarter } = useAppContext();
  const [showConfirm, setShowConfirm] = useState(null);

  if (!selectedFund) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-500 mb-2">
          Select Quarter
        </label>
        <div className="text-sm text-gray-500 p-2 bg-gray-100 rounded border border-gray-300">
          Select a fund first
        </div>
      </div>
    );
  }

  const handleDelete = async (quarterId) => {
    try {
      await deleteQuarter(quarterId);
      toast.success('Quarter deleted successfully');
      if (selectedQuarter?.id === quarterId) {
        setSelectedQuarter(null);
      }
      setShowConfirm(null);
    } catch (error) {
      toast.error('Failed to delete quarter');
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Quarters
      </label>
      {quarters.length === 0 ? (
        <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded border border-gray-200">
          No quarters found. Upload a report to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {quarters.map(quarter => (
            <div
              key={quarter.id}
              className={`p-3 rounded border cursor-pointer transition ${
                selectedQuarter?.id === quarter.id
                  ? 'bg-blue-50 border-blue-500'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <div
                  onClick={() => setSelectedQuarter(quarter)}
                  className="flex-1"
                >
                  <div className="font-medium text-gray-900">
                    {formatQuarter(quarter.year, quarter.quarter)}
                  </div>
                  {quarter.pdf_filename && (
                    <div className="text-xs text-gray-500 truncate mt-1">
                      {quarter.pdf_filename}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfirm(quarter.id);
                  }}
                  className="ml-2 text-red-600 hover:text-red-800 p-1"
                  title="Delete quarter"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {showConfirm === quarter.id && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-700 mb-2">
                    Delete this quarter? This will also delete all associated portfolio data.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(quarter.id)}
                      className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setShowConfirm(null)}
                      className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuarterSelector;
