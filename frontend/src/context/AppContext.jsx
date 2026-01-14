import React, { createContext, useContext, useState, useEffect } from 'react';
import { fundAPI, quarterAPI, investmentAPI } from '../services/api';
import toast from 'react-hot-toast';

const AppContext = createContext();

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

export function AppProvider({ children }) {
  const [funds, setFunds] = useState([]);
  const [selectedFund, setSelectedFund] = useState(null);
  const [quarters, setQuarters] = useState([]);
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState({
    funds: false,
    quarters: false,
    investments: false,
  });

  useEffect(() => {
    loadFunds();
  }, []);

  useEffect(() => {
    if (selectedFund) {
      loadQuarters(selectedFund.id);
    } else {
      setQuarters([]);
      setSelectedQuarter(null);
      setInvestments([]);
    }
  }, [selectedFund]);

  useEffect(() => {
    if (selectedQuarter) {
      loadInvestments(selectedQuarter.id);
    } else {
      setInvestments([]);
    }
  }, [selectedQuarter]);

  async function loadFunds() {
    try {
      setLoading(prev => ({ ...prev, funds: true }));
      const response = await fundAPI.getAll();
      setFunds(response.data.data);
    } catch (error) {
      console.error('Error loading funds:', error);
      toast.error('Failed to load funds');
    } finally {
      setLoading(prev => ({ ...prev, funds: false }));
    }
  }

  async function loadQuarters(fundId) {
    try {
      setLoading(prev => ({ ...prev, quarters: true }));
      const response = await quarterAPI.getAll({ fund_id: fundId });
      setQuarters(response.data.data);
    } catch (error) {
      console.error('Error loading quarters:', error);
      toast.error('Failed to load quarters');
    } finally {
      setLoading(prev => ({ ...prev, quarters: false }));
    }
  }

  async function loadInvestments(quarterId) {
    try {
      setLoading(prev => ({ ...prev, investments: true }));
      const response = await investmentAPI.getAll({ quarter_id: quarterId });
      setInvestments(response.data.data);
    } catch (error) {
      console.error('Error loading investments:', error);
      toast.error('Failed to load investments');
    } finally {
      setLoading(prev => ({ ...prev, investments: false }));
    }
  }

  async function createFund(name, description) {
    try {
      const response = await fundAPI.create({ name, description });
      await loadFunds();
      toast.success('Fund created successfully');
      return response.data.data;
    } catch (error) {
      console.error('Error creating fund:', error);
      toast.error(error.response?.data?.error || 'Failed to create fund');
      throw error;
    }
  }

  async function deleteFund(id) {
    try {
      await fundAPI.delete(id);
      await loadFunds();
      if (selectedFund?.id === id) {
        setSelectedFund(null);
      }
      toast.success('Fund deleted successfully');
    } catch (error) {
      console.error('Error deleting fund:', error);
      toast.error('Failed to delete fund');
      throw error;
    }
  }

  async function deleteQuarter(id) {
    try {
      await quarterAPI.delete(id);
      if (selectedFund) {
        await loadQuarters(selectedFund.id);
      }
      if (selectedQuarter?.id === id) {
        setSelectedQuarter(null);
      }
      toast.success('Quarter deleted successfully');
    } catch (error) {
      console.error('Error deleting quarter:', error);
      toast.error('Failed to delete quarter');
      throw error;
    }
  }

  async function deleteInvestment(id) {
    try {
      await investmentAPI.delete(id);
      if (selectedQuarter) {
        await loadInvestments(selectedQuarter.id);
      }
      toast.success('Investment deleted successfully');
    } catch (error) {
      console.error('Error deleting investment:', error);
      toast.error('Failed to delete investment');
      throw error;
    }
  }

  async function updateInvestment(id, data) {
    try {
      await investmentAPI.update(id, data);
      if (selectedQuarter) {
        await loadInvestments(selectedQuarter.id);
      }
      toast.success('Investment updated successfully');
    } catch (error) {
      console.error('Error updating investment:', error);
      toast.error('Failed to update investment');
      throw error;
    }
  }

  async function saveBulkInvestments(quarterId, investments) {
    try {
      await investmentAPI.createBulk({ quarter_id: quarterId, investments });
      if (selectedQuarter?.id === quarterId) {
        await loadInvestments(quarterId);
      }
      toast.success(`${investments.length} investments saved successfully`);
    } catch (error) {
      console.error('Error saving investments:', error);
      toast.error('Failed to save investments');
      throw error;
    }
  }

  const value = {
    funds,
    selectedFund,
    setSelectedFund,
    quarters,
    selectedQuarter,
    setSelectedQuarter,
    investments,
    loading,
    loadFunds,
    loadQuarters,
    loadInvestments,
    createFund,
    deleteFund,
    deleteQuarter,
    deleteInvestment,
    updateInvestment,
    saveBulkInvestments,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
