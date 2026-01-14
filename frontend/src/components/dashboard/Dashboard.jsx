import React, { useState } from 'react';
import Header from '../common/Header';
import FundSelector from '../filters/FundSelector';
import QuarterSelector from '../filters/QuarterSelector';
import SummaryCards from './SummaryCards';
import ExpenseSummary from './ExpenseSummary';
import InvestmentBarChart from '../charts/InvestmentBarChart';
import QuarterlyValueChart from '../charts/QuarterlyValueChart';
import MultipleOverTimeChart from '../charts/MultipleOverTimeChart';
import PortfolioPieChart from '../charts/PortfolioPieChart';
import InvestmentTable from '../tables/InvestmentTable';
import { useAppContext } from '../../context/AppContext';
import { formatQuarter, formatCurrencyShort } from '../../utils/formatters';
import toast from 'react-hot-toast';

function Dashboard() {
  const { selectedFund, selectedQuarter, deleteQuarter } = useAppContext();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get base server URL for PDF viewing
  const getServerBaseURL = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    return apiUrl.replace('/api', '');
  };

  const handleDeleteQuarter = async () => {
    if (!selectedQuarter) return;
    try {
      await deleteQuarter(selectedQuarter.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      // Error is already handled in context
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1 bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Filters</h2>
            <FundSelector />
            <QuarterSelector />
          </div>

          <div className="lg:col-span-3">
            {selectedQuarter ? (
              <>
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedFund?.name} - {formatQuarter(selectedQuarter.year, selectedQuarter.quarter)}
                    </h2>
                    {selectedQuarter.pdf_filename && (
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedQuarter.pdf_filename}
                      </p>
                    )}
                    {selectedQuarter.capital_commitments > 0 && (
                      <p className="text-sm text-blue-600 font-medium mt-1">
                        Fund Size: {formatCurrencyShort(selectedQuarter.capital_commitments)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    {selectedQuarter.pdf_path && (
                      <button
                        onClick={() => window.open(`${getServerBaseURL()}${selectedQuarter.pdf_path}`, '_blank')}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View PDF
                      </button>
                    )}
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Report
                    </button>
                  </div>
                </div>

                <SummaryCards />

                <ExpenseSummary />

                <div className="mt-6 grid grid-cols-1 gap-6">
                  <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      Cost vs Value Performance
                    </h3>
                    <InvestmentBarChart />
                  </div>

                  <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      Portfolio Composition
                    </h3>
                    <PortfolioPieChart />
                  </div>

                  {selectedFund && (
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">
                        Fund Value Over Time
                      </h3>
                      <QuarterlyValueChart />
                    </div>
                  )}

                  {selectedFund && (
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">
                        Multiple Performance Over Time
                      </h3>
                      <MultipleOverTimeChart />
                    </div>
                  )}

                  <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      Portfolio Details
                    </h3>
                    <InvestmentTable />
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No quarter selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedFund
                    ? 'Select a quarter to view portfolio data and charts'
                    : 'Select a fund and quarter to get started'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Delete Quarter Report?</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete {formatQuarter(selectedQuarter?.year, selectedQuarter?.quarter)}?
              This will permanently delete all associated portfolio data.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteQuarter}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
