import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency, formatCurrencyShort } from '../../utils/formatters';

function InvestmentBarChart() {
  const { investments } = useAppContext();

  if (investments.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No investment data available
      </div>
    );
  }

  const data = investments.map(inv => ({
    name: inv.company_name.length > 15
      ? inv.company_name.substring(0, 15) + '...'
      : inv.company_name,
    fullName: inv.company_name,
    cost: inv.cost,
    value: inv.current_value,
  }));

  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{payload[0].payload.fullName}</p>
          <p className="text-sm">Cost: {formatCurrency(payload[0].payload.cost)}</p>
          <p className="text-sm">Value: {formatCurrency(payload[0].payload.value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
        <YAxis tickFormatter={(value) => formatCurrencyShort(value)} />
        <Tooltip content={customTooltip} />
        <Legend />
        <Bar dataKey="cost" fill="#3b82f6" name="Cost" />
        <Bar dataKey="value" fill="#10b981" name="Value" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default InvestmentBarChart;
