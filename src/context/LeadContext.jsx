import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const LeadContext = createContext({});

export function LeadProvider({ children }) {
  const [allLeadsRaw, setAllLeadsRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error: sbError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (sbError) throw sbError;
      setAllLeadsRaw(data || []);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError(err.message);
      if (err.message.includes('placeholder')) {
         setError('Supabase not configured. Using empty list.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Derive active vs trashed locally
  const leads = allLeadsRaw.filter(l => !l.is_deleted);
  const trashedLeads = allLeadsRaw.filter(l => Boolean(l.is_deleted));

  const addLead = async (leadData) => {
    try {
      const { data, error: sbError } = await supabase
        .from('leads')
        .insert([leadData])
        .select();

      if (sbError) throw sbError;
      if (data) {
        setAllLeadsRaw([data[0], ...allLeadsRaw]);
      }
      return { success: true };
    } catch (err) {
      console.error('Error adding lead:', err);
      return { success: false, error: err.message };
    }
  };

  const updateLead = async (id, updates) => {
    try {
      const { data, error: sbError } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select();

      if (sbError) throw sbError;
      if (data) {
        setAllLeadsRaw(allLeadsRaw.map(l => l.id === id ? data[0] : l));
      }
      return { success: true };
    } catch (err) {
      console.error('Error updating lead:', err);
      return { success: false, error: err.message };
    }
  };

  // Soft Delete
  const deleteLead = async (id) => {
    return await updateLead(id, { is_deleted: true });
  };

  // Restore
  const restoreLead = async (id) => {
    return await updateLead(id, { is_deleted: false });
  };

  // Hard Delete
  const hardDeleteLead = async (id) => {
    try {
      const { error: sbError } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (sbError) throw sbError;
      setAllLeadsRaw(allLeadsRaw.filter(l => l.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error hard deleting lead:', err);
      return { success: false, error: err.message };
    }
  };

  return (
    <LeadContext.Provider value={{ 
      leads, 
      trashedLeads, 
      loading, 
      error, 
      fetchLeads, 
      addLead, 
      updateLead, 
      deleteLead, 
      restoreLead, 
      hardDeleteLead 
    }}>
      {children}
    </LeadContext.Provider>
  );
}

export const useLeads = () => useContext(LeadContext);
