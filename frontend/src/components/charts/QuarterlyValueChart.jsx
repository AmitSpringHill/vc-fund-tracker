import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAppContext } from '../../context/AppContext';
import { analyticsAPI } from '../../services/api';
import { formatCurrency, formatCurrencyShort, formatQuarter } from '../../utils/formatters';

function QuarterlyValueChart() {
  const { selectedFund } = useAppContext();
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedFund) {
      loadTimeline();
    }
  }, [selectedFund]);

  async function loadTimeline() {
    try {
      setLoading(true);
      const response = await analyticsAPI.getFundTimeline(selectedFund.id);
      setTimelineData(response.data.data);
    } catch (error) {
      console.error('Error loading timeline:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center text-gray-500 py-8">Loading...</div>;
  }

  if (timelineData.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No quarterly data available
      </div>
    );
  }

  const data = timelineData.map(item => ({
    quarter: formatQuarter(item.year, item.quarter),
    value: item.total_value || 0,
    cost: item.total_cost || 0,
  }));

  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{payload[0].payload.quarter}</p>
          <p className="text-sm">Value: {formatCurrency(payload[0].payload.value)}</p>
          <p className="text-sm">Cost: {formatCurrency(payload[0].payload.cost)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="quarter" />
        <YAxis tickFormatter={(value) => formatCurrencyShort(value)} />
        <Tooltip content={customTooltip} />
        <Legend />
        <Line type="monotone" dataKey="value" stroke="#10b981" name="Fund Value" strokeWidth={2} />
        <Line type="monotone" dataKey="cost" stroke="#3b82f6" name="Total Cost" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default QuarterlyValueChart;
