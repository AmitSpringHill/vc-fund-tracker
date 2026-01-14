import React from 'react';
import Header from '../common/Header';
import FundSelector from '../filters/FundSelector';
import QuarterSelector from '../filters/QuarterSelector';
import SummaryCards from './SummaryCards';
import InvestmentBarChart from '../charts/InvestmentBarChart';
import QuarterlyValueChart from '../charts/QuarterlyValueChart';
import PortfolioPieChart from '../charts/PortfolioPieChart';
import InvestmentTable from '../tables/InvestmentTable';
import { useAppContext } from '../../context/AppContext';

function Dashboard() {
  const { selectedFund, selectedQuarter } = useAppContext();

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
                <SummaryCards />

                <div className="mt-6 grid grid-cols-1 gap-6">
                  <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      Investment Performance (Cost vs Value)
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

                  <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      Investment Details
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
                    ? 'Select a quarter to view investment data and charts'
                    : 'Select a fund and quarter to get started'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
