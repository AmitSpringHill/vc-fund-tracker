import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAppContext } from '../../context/AppContext';
import { uploadAPI } from '../../services/api';
import toast from 'react-hot-toast';

function PDFUpload({ onClose }) {
  const { funds, loadFunds, saveBulkInvestments, loadQuarters, setSelectedQuarter, setSelectedFund } = useAppContext();
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState(null);
  const [fundName, setFundName] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState(1);
  const [editableInvestments, setEditableInvestments] = useState([]);
  const [step, setStep] = useState(1); // 1: Upload, 2: Review metadata and investments

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    },
  });

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a PDF file');
      return;
    }

    try {
      setAnalyzing(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await uploadAPI.analyzePDF(formData);

      if (response.data.success) {
        setAnalyzedData(response.data);

        // Set detected metadata
        if (response.data.detectedMetadata.fundName) {
          setFundName(response.data.detectedMetadata.fundName);
        }
        if (response.data.detectedMetadata.year) {
          setYear(response.data.detectedMetadata.year);
        }
        if (response.data.detectedMetadata.quarter) {
          setQuarter(response.data.detectedMetadata.quarter);
        }

        // Set investments
        setEditableInvestments(
          response.data.extractedInvestments.map((inv, idx) => ({
            ...inv,
            tempId: idx,
          }))
        );

        setStep(2);
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error.response?.data?.error || 'Failed to analyze PDF');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirmAndSave = async () => {
    if (!fundName || !year || !quarter) {
      toast.error('Please fill in fund name, year, and quarter');
      return;
    }

    try {
      const existingFund = funds.find(f => f.name.toLowerCase() === fundName.toLowerCase());

      const confirmData = {
        fund_id: existingFund?.id,
        fund_name: fundName,
        year: year,
        quarter: quarter,
        pdf_path: analyzedData.pdfPath,
        pdf_filename: analyzedData.pdfFilename,
        create_fund: !existingFund,
      };

      const response = await uploadAPI.confirmUpload(confirmData);

      if (response.data.success) {
        const quarterId = response.data.quarter.id;

        // Save investments if any
        if (editableInvestments.length > 0) {
          const investmentsToSave = editableInvestments.map(({ tempId, ...inv }) => inv);
          await saveBulkInvestments(quarterId, investmentsToSave);
        } else {
          toast.success('Quarter created successfully');
        }

        // Reload funds and set selection
        await loadFunds();
        const fund = funds.find(f => f.id === response.data.fundId) ||
                     (await loadFunds(), funds.find(f => f.id === response.data.fundId));

        if (fund) {
          setSelectedFund(fund);
          await loadQuarters(fund.id);
        }

        onClose();
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.error || 'Failed to save data');
    }
  };

  const handleUpdateInvestment = (tempId, field, value) => {
    setEditableInvestments(prev =>
      prev.map(inv =>
        inv.tempId === tempId ? { ...inv, [field]: value } : inv
      )
    );
  };

  const handleRemoveInvestment = (tempId) => {
    setEditableInvestments(prev => prev.filter(inv => inv.tempId !== tempId));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {step === 1 ? 'Upload PDF Report' : 'Review & Confirm'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <form onSubmit={handleAnalyze}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select PDF File *
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                    isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  {file ? (
                    <div>
                      <p className="text-green-600 font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Click or drag to replace
                      </p>
                    </div>
                  ) : (
                    <div>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">
                        {isDragActive ? 'Drop the PDF here' : 'Drag and drop a PDF here, or click to select'}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        The system will automatically detect fund name and quarter from the PDF
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={analyzing || !file}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {analyzing ? 'Analyzing...' : 'Analyze PDF'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-800 font-medium">PDF analyzed successfully!</p>
                <p className="text-blue-700 text-sm mt-1">
                  {analyzedData?.detectedMetadata?.detected
                    ? 'Fund name and quarter were automatically detected. Please review and confirm.'
                    : 'Could not auto-detect all information. Please enter manually.'}
                </p>
              </div>

              <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
                <h3 className="font-semibold mb-3">Fund & Quarter Information</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fund Name *
                  </label>
                  <input
                    type="text"
                    value={fundName}
                    onChange={(e) => setFundName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Tech Ventures Fund I"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {funds.find(f => f.name.toLowerCase() === fundName.toLowerCase())
                      ? 'This fund already exists'
                      : 'A new fund will be created'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year *
                    </label>
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value))}
                      min="2000"
                      max="2100"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quarter *
                    </label>
                    <select
                      value={quarter}
                      onChange={(e) => setQuarter(parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="1">Q1</option>
                      <option value="2">Q2</option>
                      <option value="3">Q3</option>
                      <option value="4">Q4</option>
                    </select>
                  </div>
                </div>
              </div>

              {editableInvestments.length > 0 ? (
                <>
                  <h3 className="text-lg font-semibold mb-4">
                    Review Investments ({editableInvestments.length})
                  </h3>
                  <div className="overflow-x-auto mb-4 max-h-64 overflow-y-auto border rounded">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                          <th className="px-4 py-2"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {editableInvestments.map(inv => (
                          <tr key={inv.tempId}>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                value={inv.company_name}
                                onChange={(e) => handleUpdateInvestment(inv.tempId, 'company_name', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="date"
                                value={inv.investment_date || ''}
                                onChange={(e) => handleUpdateInvestment(inv.tempId, 'investment_date', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                value={inv.cost}
                                onChange={(e) => handleUpdateInvestment(inv.tempId, 'cost', parseFloat(e.target.value))}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                min="0"
                                step="0.01"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                value={inv.current_value}
                                onChange={(e) => handleUpdateInvestment(inv.tempId, 'current_value', parseFloat(e.target.value))}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                min="0"
                                step="0.01"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <button
                                onClick={() => handleRemoveInvestment(inv.tempId)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-800 text-sm">
                    No investments were automatically extracted. You can add them manually after saving the quarter.
                  </p>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmAndSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Confirm & Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PDFUpload;
