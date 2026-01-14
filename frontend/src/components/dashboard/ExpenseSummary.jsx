import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { analyticsAPI, quarterAPI } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

function ExpenseSummary() {
  const { selectedFund, selectedQuarter, quarters } = useAppContext();
  const [expenseAverages, setExpenseAverages] = useState(null);
  const [ytdData, setYtdData] = useState({ management_fees: 0, operating_costs: 0, formation_costs: 0 });

  useEffect(() => {
    loadExpenseAverages();
  }, []);

  useEffect(() => {
    if (selectedQuarter && selectedFund) {
      calculateYTD();
    }
  }, [selectedQuarter, selectedFund, quarters]);

  const loadExpenseAverages = async () => {
    try {
      const response = await analyticsAPI.getExpenseAverages();
      setExpenseAverages(response.data.data);
    } catch (error) {
      console.error('Error loading expense averages:', error);
    }
  };

  const calculateYTD = () => {
    if (!selectedQuarter || !selectedFund) return;

    // Get all quarters for this fund in the same year up to current quarter
    const fundQuarters = quarters.filter(q =>
      q.year === selectedQuarter.year && q.quarter <= selectedQuarter.quarter
    );

    const ytd = {
      management_fees: fundQuarters.reduce((sum, q) => sum + (q.management_fees || 0), 0),
      operating_costs: fundQuarters.reduce((sum, q) => sum + (q.operating_costs || 0), 0),
      formation_costs: fundQuarters.reduce((sum, q) => sum + (q.formation_costs || 0), 0),
    };

    setYtdData(ytd);
  };

  if (!selectedQuarter) {
    return null;
  }

  const capitalCommitments = selectedQuarter.capital_commitments || 0;
  const managementFees = selectedQuarter.management_fees || 0;
  const operatingCosts = selectedQuarter.operating_costs || 0;
  const formationCosts = selectedQuarter.formation_costs || 0;

  // Calculate percentages
  const managementFeesPct = capitalCommitments > 0 ? (managementFees / capitalCommitments) * 100 : 0;
  const operatingCostsPct = capitalCommitments > 0 ? (operatingCosts / capitalCommitments) * 100 : 0;
  const formationCostsPct = capitalCommitments > 0 ? (formationCosts / capitalCommitments) * 100 : 0;

  const ytdManagementFeesPct = capitalCommitments > 0 ? (ytdData.management_fees / capitalCommitments) * 100 : 0;
  const ytdOperatingCostsPct = capitalCommitments > 0 ? (ytdData.operating_costs / capitalCommitments) * 100 : 0;
  const ytdFormationCostsPct = capitalCommitments > 0 ? (ytdData.formation_costs / capitalCommitments) * 100 : 0;

  const renderAboveBelowIndicator = (currentPct, avgPct) => {
    if (!expenseAverages || avgPct === 0) return null;

    const isAbove = currentPct > avgPct;
    const difference = Math.abs(currentPct - avgPct).toFixed(2);

    return (
      <span className={`text-xs ml-2 ${isAbove ? 'text-red-600' : 'text-green-600'}`}>
        {isAbove ? '↑' : '↓'} {difference}% {isAbove ? 'above' : 'below'} avg
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Fund Size & Expenses</h3>

      {/* Fund Size */}
      {capitalCommitments > 0 && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <p className="text-sm text-gray-600">Capital Commitments (Fund Size)</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(capitalCommitments)}</p>
        </div>
      )}

      {/* Expense Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Management Fees */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-gray-700">Management Fees</p>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">This Quarter</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(managementFees)}</p>
              {capitalCommitments > 0 && (
                <p className="text-xs text-gray-600">
                  {managementFeesPct.toFixed(2)}% of commitments
                  {renderAboveBelowIndicator(managementFeesPct, expenseAverages?.avg_management_fees_pct || 0)}
                </p>
              )}
            </div>
            <div className="border-t border-gray-200 pt-2">
              <p className="text-xs text-gray-500">Year-to-Date</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(ytdData.management_fees)}</p>
              {capitalCommitments > 0 && (
                <p className="text-xs text-gray-600">
                  {ytdManagementFeesPct.toFixed(2)}% of commitments
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Operating Costs */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-gray-700">Operating Costs</p>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">This Quarter</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(operatingCosts)}</p>
              {capitalCommitments > 0 && (
                <p className="text-xs text-gray-600">
                  {operatingCostsPct.toFixed(2)}% of commitments
                  {renderAboveBelowIndicator(operatingCostsPct, expenseAverages?.avg_operating_costs_pct || 0)}
                </p>
              )}
            </div>
            <div className="border-t border-gray-200 pt-2">
              <p className="text-xs text-gray-500">Year-to-Date</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(ytdData.operating_costs)}</p>
              {capitalCommitments > 0 && (
                <p className="text-xs text-gray-600">
                  {ytdOperatingCostsPct.toFixed(2)}% of commitments
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Formation Costs */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-gray-700">Formation Costs</p>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">This Quarter</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(formationCosts)}</p>
              {capitalCommitments > 0 && (
                <p className="text-xs text-gray-600">
                  {formationCostsPct.toFixed(2)}% of commitments
                  {renderAboveBelowIndicator(formationCostsPct, expenseAverages?.avg_formation_costs_pct || 0)}
                </p>
              )}
            </div>
            <div className="border-t border-gray-200 pt-2">
              <p className="text-xs text-gray-500">Year-to-Date</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(ytdData.formation_costs)}</p>
              {capitalCommitments > 0 && (
                <p className="text-xs text-gray-600">
                  {ytdFormationCostsPct.toFixed(2)}% of commitments
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {expenseAverages && expenseAverages.total_quarters > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            System averages based on {expenseAverages.total_quarters} quarter(s) with capital commitments data
          </p>
        </div>
      )}
    </div>
  );
}

export default ExpenseSummary;
