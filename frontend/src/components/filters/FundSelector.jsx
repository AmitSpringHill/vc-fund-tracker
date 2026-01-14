import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

function FundSelector() {
  const { funds, selectedFund, setSelectedFund, loading, deleteFund } = useAppContext();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteFund = async () => {
    if (!selectedFund) return;
    try {
      await deleteFund(selectedFund.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      // Error is already handled in context
    }
  };

  return (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Fund
        </label>
        <select
          value={selectedFund?.id || ''}
          onChange={(e) => {
            const fund = funds.find(f => f.id === parseInt(e.target.value));
            setSelectedFund(fund || null);
          }}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          disabled={loading.funds}
        >
          <option value="">-- Select a Fund --</option>
          {funds.map(fund => (
            <option key={fund.id} value={fund.id}>
              {fund.name}
            </option>
          ))}
        </select>

        {selectedFund && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="mt-2 w-full px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Fund
          </button>
        )}
      </div>

      {showDeleteConfirm && selectedFund && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Delete Fund?</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete <strong>{selectedFund.name}</strong>?
              This will permanently delete the fund and all its quarterly reports and investment data.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFund}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete Fund
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FundSelector;
