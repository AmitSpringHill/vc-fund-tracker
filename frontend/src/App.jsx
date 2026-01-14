import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import Dashboard from './components/dashboard/Dashboard';

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#fff',
              color: '#1f2937',
              border: '1px solid #e5e7eb',
            },
          }}
        />
        <Dashboard />
      </div>
    </AppProvider>
  );
}

export default App;
