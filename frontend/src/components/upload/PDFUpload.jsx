import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAppContext } from '../../context/AppContext';
import { uploadAPI } from '../../services/api';
import toast from 'react-hot-toast';

function PDFUpload({ onClose }) {
  const { funds, loadFunds, saveBulkInvestments, loadQuarters, setSelectedQuarter, setSelectedFund } = useAppContext();
  const [files, setFiles] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedReports, setAnalyzedReports] = useState([]); // Array of { file, fundName, year, quarter, investments, pdfPath, pdfFilename }
  const [step, setStep] = useState(1); // 1: Upload, 2: Review all reports

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFiles(acceptedFiles);
      }
    },
  });

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      toast.error('Please select at least one PDF file');
      return;
    }

    try {
      setAnalyzing(true);
      const results = [];

      // Process each file sequentially
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        toast.loading(`Analyzing ${file.name} (${i + 1}/${files.length})...`, { id: 'analyzing' });

        try {
          const formData = new FormData();
          formData.append('file', file);

          const response = await uploadAPI.analyzePDF(formData);

          if (response.data.success) {
            results.push({
              file: file,
              fundName: response.data.detectedMetadata.fundName || '',
              year: response.data.detectedMetadata.year || new Date().getFullYear(),
              quarter: response.data.detectedMetadata.quarter || 1,
              investments: response.data.extractedInvestments.map((inv, idx) => ({
                ...inv,
                tempId: `${i}-${idx}`,
              })),
              pdfPath: response.data.pdfPath,
              pdfFilename: response.data.pdfFilename,
              expenseData: response.data.expenseData || {
                capital_commitments: 0,
                management_fees: 0,
                operating_costs: 0,
                formation_costs: 0
              },
            });
          }
        } catch (error) {
          console.error(`Error analyzing ${file.name}:`, error);
          toast.error(`Failed to analyze ${file.name}`);
        }
      }

      toast.dismiss('analyzing');

      if (results.length > 0) {
        setAnalyzedReports(results);
        setStep(2);
        toast.success(`Successfully analyzed ${results.length} report(s)`);
      } else {
        toast.error('Failed to analyze any reports');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze PDFs');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirmAndSave = async () => {
    try {
      let successCount = 0;
      let failCount = 0;

      // Process each report
      for (let i = 0; i < analyzedReports.length; i++) {
        const report = analyzedReports[i];

        if (!report.fundName || !report.year || !report.quarter) {
          toast.error(`Skipping ${report.file.name}: Missing fund name, year, or quarter`);
          failCount++;
          continue;
        }

        toast.loading(`Saving ${report.file.name} (${i + 1}/${analyzedReports.length})...`, { id: 'saving' });

        try {
          const existingFund = funds.find(f => f.name.toLowerCase() === report.fundName.toLowerCase());

          const confirmData = {
            fund_id: existingFund?.id,
            fund_name: report.fundName,
            year: report.year,
            quarter: report.quarter,
            pdf_path: report.pdfPath,
            pdf_filename: report.pdfFilename,
            create_fund: !existingFund,
            capital_commitments: report.expenseData.capital_commitments,
            management_fees: report.expenseData.management_fees,
            operating_costs: report.expenseData.operating_costs,
            formation_costs: report.expenseData.formation_costs,
          };

          const response = await uploadAPI.confirmUpload(confirmData);

          if (response.data.success) {
            const quarterId = response.data.quarter.id;

            // Save investments if any
            if (report.investments.length > 0) {
              const investmentsToSave = report.investments.map(({ tempId, ...inv }) => inv);
              await saveBulkInvestments(quarterId, investmentsToSave);
            }

            successCount++;
          }
        } catch (error) {
          console.error(`Error saving ${report.file.name}:`, error);
          toast.error(`Failed to save ${report.file.name}: ${error.response?.data?.error || error.message}`);
          failCount++;
        }
      }

      toast.dismiss('saving');

      // Reload funds
      await loadFunds();

      if (successCount > 0) {
        toast.success(`Successfully saved ${successCount} report(s)${failCount > 0 ? `, ${failCount} failed` : ''}`);
        onClose();
      } else {
        toast.error('Failed to save any reports');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save reports');
    }
  };

  const handleUpdateReport = (reportIndex, field, value) => {
    setAnalyzedReports(prev =>
      prev.map((report, idx) =>
        idx === reportIndex ? { ...report, [field]: value } : report
      )
    );
  };

  const handleUpdateInvestment = (reportIndex, tempId, field, value) => {
    setAnalyzedReports(prev =>
      prev.map((report, idx) =>
        idx === reportIndex
          ? {
              ...report,
              investments: report.investments.map(inv =>
                inv.tempId === tempId ? { ...inv, [field]: value } : inv
              ),
            }
          : report
      )
    );
  };

  const handleRemoveInvestment = (reportIndex, tempId) => {
    setAnalyzedReports(prev =>
      prev.map((report, idx) =>
        idx === reportIndex
          ? {
              ...report,
              investments: report.investments.filter(inv => inv.tempId !== tempId),
            }
          : report
      )
    );
  };

  const handleRemoveReport = (reportIndex) => {
    setAnalyzedReports(prev => prev.filter((_, idx) => idx !== reportIndex));
    if (analyzedReports.length === 1) {
      setStep(1);
      setFiles([]);
    }
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
                  Select PDF Files *
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                    isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  {files.length > 0 ? (
                    <div>
                      <p className="text-green-600 font-medium">{files.length} file(s) selected</p>
                      <div className="mt-2 text-sm text-gray-600 max-h-32 overflow-y-auto">
                        {files.map((f, idx) => (
                          <div key={idx}>{f.name}</div>
                        ))}
                      </div>
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
                        {isDragActive ? 'Drop the PDFs here' : 'Drag and drop PDFs here, or click to select'}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        You can upload multiple reports at once. The system will automatically detect fund name and quarter from each PDF.
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
                  disabled={analyzing || files.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {analyzing ? 'Analyzing...' : `Analyze ${files.length} PDF(s)`}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-800 font-medium">{analyzedReports.length} report(s) analyzed successfully!</p>
                <p className="text-blue-700 text-sm mt-1">
                  Please review and confirm the extracted data below.
                </p>
              </div>

              {analyzedReports.map((report, reportIdx) => (
                <div key={reportIdx} className="mb-6 p-4 bg-gray-50 border border-gray-300 rounded-md">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg">Report {reportIdx + 1}: {report.file.name}</h3>
                    <button
                      onClick={() => handleRemoveReport(reportIdx)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fund Name *
                    </label>
                    <input
                      type="text"
                      value={report.fundName}
                      onChange={(e) => handleUpdateReport(reportIdx, 'fundName', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="e.g., Tech Ventures Fund I"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year *
                      </label>
                      <input
                        type="number"
                        value={report.year}
                        onChange={(e) => handleUpdateReport(reportIdx, 'year', parseInt(e.target.value))}
                        min="2000"
                        max="2100"
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quarter *
                      </label>
                      <select
                        value={report.quarter}
                        onChange={(e) => handleUpdateReport(reportIdx, 'quarter', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="1">Q1</option>
                        <option value="2">Q2</option>
                        <option value="3">Q3</option>
                        <option value="4">Q4</option>
                      </select>
                    </div>
                  </div>

                  {report.investments.length > 0 ? (
                    <>
                      <h4 className="text-sm font-semibold mb-2">
                        Investments ({report.investments.length})
                      </h4>
                      <div className="overflow-x-auto max-h-48 overflow-y-auto border rounded">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100 sticky top-0">
                            <tr>
                              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Company</th>
                              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Date</th>
                              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Cost</th>
                              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Value</th>
                              <th className="px-2 py-1"></th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {report.investments.map(inv => (
                              <tr key={inv.tempId}>
                                <td className="px-2 py-1">
                                  <input
                                    type="text"
                                    value={inv.company_name}
                                    onChange={(e) => handleUpdateInvestment(reportIdx, inv.tempId, 'company_name', e.target.value)}
                                    className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs"
                                  />
                                </td>
                                <td className="px-2 py-1">
                                  <input
                                    type="date"
                                    value={inv.investment_date || ''}
                                    onChange={(e) => handleUpdateInvestment(reportIdx, inv.tempId, 'investment_date', e.target.value)}
                                    className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs"
                                  />
                                </td>
                                <td className="px-2 py-1">
                                  <input
                                    type="number"
                                    value={inv.cost}
                                    onChange={(e) => handleUpdateInvestment(reportIdx, inv.tempId, 'cost', parseFloat(e.target.value))}
                                    className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs"
                                    min="0"
                                    step="0.01"
                                  />
                                </td>
                                <td className="px-2 py-1">
                                  <input
                                    type="number"
                                    value={inv.current_value}
                                    onChange={(e) => handleUpdateInvestment(reportIdx, inv.tempId, 'current_value', parseFloat(e.target.value))}
                                    className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs"
                                    min="0"
                                    step="0.01"
                                  />
                                </td>
                                <td className="px-2 py-1">
                                  <button
                                    onClick={() => handleRemoveInvestment(reportIdx, inv.tempId)}
                                    className="text-red-600 hover:text-red-800 text-xs"
                                  >
                                    ×
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                      No investments extracted
                    </div>
                  )}
                </div>
              ))}

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setStep(1); setAnalyzedReports([]); setFiles([]); }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmAndSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Save All ({analyzedReports.length} Reports)
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
