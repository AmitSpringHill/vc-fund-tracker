import React from 'react';
import { useAppContext } from '../../context/AppContext';

function FundSelector() {
  const { funds, selectedFund, setSelectedFund, loading } = useAppContext();

  return (
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
    </div>
  );
}

export default FundSelector;
