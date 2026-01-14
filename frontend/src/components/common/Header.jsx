import React, { useState } from 'react';
import PDFUpload from '../upload/PDFUpload';

function Header() {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <svg className="h-8 w-8 text-gray-600" viewBox="0 0 40 40" fill="currentColor">
                  <path d="M20 5L30 12V28L20 35L10 28V12L20 5Z" />
                  <path d="M20 15L25 18V25L20 28L15 25V18L20 15Z" opacity="0.6" />
                </svg>
                <div className="ml-3">
                  <div className="text-xl font-bold text-gray-900 tracking-tight">
                    SPRINGHILL
                  </div>
                  <div className="text-xs text-gray-500 -mt-1">
                    VENTURE PARTNERS
                  </div>
                </div>
              </div>
              <div className="hidden md:block h-8 w-px bg-gray-300 mx-4"></div>
              <div className="hidden md:block">
                <h1 className="text-lg font-semibold text-gray-900">
                  Fund Tracker
                </h1>
                <p className="text-xs text-gray-500 -mt-1">
                  Portfolio Analytics Platform
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUpload(true)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Upload Report
            </button>
          </div>
        </div>
      </header>

      {showUpload && (
        <PDFUpload onClose={() => setShowUpload(false)} />
      )}
    </>
  );
}

export default Header;
