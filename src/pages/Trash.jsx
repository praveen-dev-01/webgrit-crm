import { useLeads } from '../context/LeadContext';
import { Trash2, RotateCcw, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function Trash() {
  const { trashedLeads, restoreLead, hardDeleteLead, loading, error } = useLeads();

  if (loading) return <div className="text-[#026cfe] animate-pulse p-4">Loading trash...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  const handleRestore = async (e, lead) => {
    e.stopPropagation();
    await restoreLead(lead.id);
  };

  const handleHardDelete = async (e, lead) => {
    e.stopPropagation();
    if (window.confirm(`Are you strictly sure you want to permanently delete ${lead.name}? This action cannot be undone.`)) {
      await hardDeleteLead(lead.id);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500 max-w-5xl mx-auto">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link to="/leads" className="inline-flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-[#026cfe] mb-2 transition-colors">
            <ArrowLeft size={16} /> Back to All Leads
          </Link>
          <h1 className="text-3xl font-bold font-syne text-gray-900 tracking-tight flex items-center gap-3">
            Recycle Bin ({trashedLeads.length})
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Deleted leads are stored here. You can restore them or delete them permanently.
          </p>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white border text-gray-400 border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
                <th className="p-4 px-6 w-1/3">Name & Phone</th>
                <th className="p-4 w-1/4">Service</th>
                <th className="p-4 w-1/4">Deal Value</th>
                <th className="p-4 w-1/6 text-right px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trashedLeads.map(lead => (
                <tr 
                  key={lead.id} 
                  className="hover:bg-red-50/30 transition-colors group opacity-80 hover:opacity-100"
                >
                  <td className="p-4 px-6">
                    <div className="font-semibold text-gray-900 text-base">{lead.name}</div>
                    <div className="text-sm text-gray-500 font-medium mt-0.5">{lead.phone_number || '-'}</div>
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-500">
                    {lead.service_needed}
                  </td>
                  <td className="p-4 text-gray-500 font-semibold">
                    {formatCurrency(lead.deal_value)}
                  </td>
                  <td className="p-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={(e) => handleRestore(e, lead)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                        title="Restore Lead"
                      >
                        <RotateCcw size={14} /> Restore
                      </button>
                      <button 
                        onClick={(e) => handleHardDelete(e, lead)}
                        className="flex items-center justify-center w-8 h-8 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors border border-red-100"
                        title="Delete Permanently"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {trashedLeads.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-32 text-center bg-gray-50/30">
                    <Trash2 className="mx-auto text-gray-300 mb-3" size={48} />
                    <div className="text-gray-400 font-medium mb-1 text-lg">Your trash is completely empty!</div>
                    <div className="text-gray-400 text-sm">Deleted leads will safely end up here.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
