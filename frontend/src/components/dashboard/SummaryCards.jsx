import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { formatCurrencyShort, formatMultiple } from '../../utils/formatters';
import {
  calculateTotalCost,
  calculateTotalValue,
  calculateAverageMultiple,
} from '../../utils/calculations';

function SummaryCards() {
  const { investments } = useAppContext();

  const totalCost = calculateTotalCost(investments);
  const totalValue = calculateTotalValue(investments);
  const avgMultiple = calculateAverageMultiple(investments);
  const count = investments.length;

  const gain = totalValue - totalCost;
  const gainPercent = totalCost > 0 ? ((gain / totalCost) * 100).toFixed(1) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <p className="text-sm text-gray-600 mb-1">Total Cost</p>
        <p className="text-2xl font-bold text-gray-900">{formatCurrencyShort(totalCost)}</p>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <p className="text-sm text-gray-600 mb-1">Total Value</p>
        <p className="text-2xl font-bold text-gray-900">{formatCurrencyShort(totalValue)}</p>
        <p className={`text-xs mt-1 ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {gain >= 0 ? '+' : ''}{formatCurrencyShort(gain)} ({gain >= 0 ? '+' : ''}{gainPercent}%)
        </p>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <p className="text-sm text-gray-600 mb-1">Multiple (Value/Cost)</p>
        <p className="text-2xl font-bold text-blue-600">{formatMultiple(avgMultiple)}</p>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <p className="text-sm text-gray-600 mb-1">Companies</p>
        <p className="text-2xl font-bold text-gray-900">{count}</p>
      </div>
    </div>
  );
}

export default SummaryCards;
