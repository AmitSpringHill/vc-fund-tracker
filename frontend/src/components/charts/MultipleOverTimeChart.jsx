import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../../context/AppContext';
import { analyticsAPI } from '../../services/api';
import { formatQuarter } from '../../utils/formatters';

function MultipleOverTimeChart() {
  const { selectedFund } = useAppContext();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedFund) {
      loadTimelineData();
    }
  }, [selectedFund]);

  const loadTimelineData = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getFundTimeline(selectedFund.id);
      const data = response.data.data.map(item => ({
        quarter: formatQuarter(item.year, item.quarter),
        multiple: parseFloat(item.multiple) || 0,
        quarterDate: item.quarter_date,
      }));
      setChartData(data);
    } catch (error) {
      console.error('Error loading timeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded p-3 shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].payload.quarter}</p>
          <p className="text-blue-600">
            Multiple: <span className="font-bold">{payload[0].value.toFixed(2)}x</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (!selectedFund) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Select a fund to view multiple over time
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading chart data...</div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available for this fund
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="quarter"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{ value: 'Multiple (x)', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#6b7280' } }}
            tickFormatter={(value) => `${value.toFixed(1)}x`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }}
            formatter={() => 'Value/Cost Multiple'}
          />
          <Line
            type="monotone"
            dataKey="multiple"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 5 }}
            activeDot={{ r: 7 }}
            name="Multiple"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MultipleOverTimeChart;
