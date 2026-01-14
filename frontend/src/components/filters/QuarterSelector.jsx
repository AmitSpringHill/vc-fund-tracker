import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { formatQuarter } from '../../utils/formatters';

function QuarterSelector() {
  const { quarters, selectedQuarter, setSelectedQuarter, selectedFund, loading } = useAppContext();

  if (!selectedFund) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-500 mb-2">
          Select Quarter
        </label>
        <select
          disabled
          className="block w-full rounded-md border-gray-300 bg-gray-100 p-2 border text-gray-500"
        >
          <option>Select a fund first</option>
        </select>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Quarter
      </label>
      <select
        value={selectedQuarter?.id || ''}
        onChange={(e) => {
          const quarter = quarters.find(q => q.id === parseInt(e.target.value));
          setSelectedQuarter(quarter || null);
        }}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
        disabled={loading.quarters}
      >
        <option value="">-- Select a Quarter --</option>
        {quarters.map(quarter => (
          <option key={quarter.id} value={quarter.id}>
            {formatQuarter(quarter.year, quarter.quarter)}
          </option>
        ))}
      </select>
    </div>
  );
}

export default QuarterSelector;
