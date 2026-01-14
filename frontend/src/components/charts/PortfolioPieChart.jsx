import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { calculateTotalValue } from '../../utils/calculations';

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

function PortfolioPieChart() {
  const { investments } = useAppContext();

  if (investments.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No investment data available
      </div>
    );
  }

  const totalValue = calculateTotalValue(investments);

  const sortedInvestments = [...investments].sort((a, b) => b.current_value - a.current_value);

  const significantInvestments = sortedInvestments.filter(
    inv => (inv.current_value / totalValue) >= 0.02
  );
  const smallInvestments = sortedInvestments.filter(
    inv => (inv.current_value / totalValue) < 0.02
  );

  const data = significantInvestments.map(inv => ({
    name: inv.company_name,
    value: inv.current_value,
    percentage: (inv.current_value / totalValue) * 100,
  }));

  if (smallInvestments.length > 0) {
    const othersValue = smallInvestments.reduce((sum, inv) => sum + inv.current_value, 0);
    data.push({
      name: 'Others',
      value: othersValue,
      percentage: (othersValue / totalValue) * 100,
    });
  }

  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm">Value: {formatCurrency(payload[0].value)}</p>
          <p className="text-sm">
            Percentage: {formatPercentage(payload[0].payload.percentage)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={customTooltip} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default PortfolioPieChart;
