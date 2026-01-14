import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency, formatDate, formatMultiple } from '../../utils/formatters';

function InvestmentTable() {
  const { investments, deleteInvestment, updateInvestment } = useAppContext();
  const [sortField, setSortField] = useState('current_value');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  if (investments.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No investments found for this quarter
      </div>
    );
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredInvestments = investments.filter(inv =>
    inv.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedInvestments = [...filteredInvestments].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const modifier = sortDirection === 'asc' ? 1 : -1;

    if (typeof aVal === 'string') {
      return aVal.localeCompare(bVal) * modifier;
    }
    return (aVal - bVal) * modifier;
  });

  const handleEdit = (inv) => {
    setEditingId(inv.id);
    setEditData({
      company_name: inv.company_name,
      investment_date: inv.investment_date,
      cost: inv.cost,
      current_value: inv.current_value,
    });
  };

  const handleSave = async (id) => {
    try {
      await updateInvestment(id, editData);
      setEditingId(null);
      setEditData({});
    } catch (error) {
      console.error('Update failed');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      await deleteInvestment(id);
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  const handleExportToExcel = () => {
    // Prepare CSV data
    const headers = ['Company Name', 'Investment Date', 'Cost', 'Current Value', 'Multiple'];
    const rows = sortedInvestments.map(inv => [
      inv.company_name,
      inv.investment_date || 'N/A',
      inv.cost,
      inv.current_value,
      inv.multiple || (inv.cost > 0 ? inv.current_value / inv.cost : 0)
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        // Handle cells that might contain commas or quotes
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `investments_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <input
          type="text"
          placeholder="Search by company name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleExportToExcel}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export to Excel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort('company_name')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Company <SortIcon field="company_name" />
              </th>
              <th
                onClick={() => handleSort('investment_date')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Date <SortIcon field="investment_date" />
              </th>
              <th
                onClick={() => handleSort('cost')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Cost <SortIcon field="cost" />
              </th>
              <th
                onClick={() => handleSort('current_value')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Value <SortIcon field="current_value" />
              </th>
              <th
                onClick={() => handleSort('multiple')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Multiple <SortIcon field="multiple" />
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedInvestments.map(inv => (
              <tr key={inv.id} className="hover:bg-gray-50">
                {editingId === inv.id ? (
                  <>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editData.company_name}
                        onChange={(e) => setEditData({ ...editData, company_name: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="date"
                        value={editData.investment_date || ''}
                        onChange={(e) => setEditData({ ...editData, investment_date: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={editData.cost}
                        onChange={(e) => setEditData({ ...editData, cost: parseFloat(e.target.value) })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        step="0.01"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={editData.current_value}
                        onChange={(e) => setEditData({ ...editData, current_value: parseFloat(e.target.value) })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        step="0.01"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {formatMultiple((editData.current_value || 0) / (editData.cost || 1))}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleSave(inv.id)}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {inv.company_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(inv.investment_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(inv.cost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {formatCurrency(inv.current_value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                      {formatMultiple(inv.multiple)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(inv)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InvestmentTable;
