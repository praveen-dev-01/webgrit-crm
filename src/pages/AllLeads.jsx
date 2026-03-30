import { useState, useMemo } from 'react';
import { useLeads } from '../context/LeadContext';
import { Download, Search, Filter, Trash2 } from 'lucide-react';
import { formatCurrency, pipelineStages, stageColors, cn } from '../lib/utils';
import { format, parseISO, isToday, isBefore, startOfToday } from 'date-fns';
import { Link } from 'react-router-dom';
import LeadDetailPanel from '../components/LeadDetailPanel';

export default function AllLeads() {
  const { leads, loading, error } = useLeads();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [selectedLead, setSelectedLead] = useState(null);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchSearch = 
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        (lead.phone_number || '').includes(search) ||
        lead.service_needed.toLowerCase().includes(search.toLowerCase());
      
      const matchStage = stageFilter === 'All' || lead.pipeline_stage === stageFilter;
      
      return matchSearch && matchStage;
    });
  }, [leads, search, stageFilter]);

  const handleExportCSV = () => {
    if (filteredLeads.length === 0) return;
    
    const headers = ['Name', 'Phone', 'Service', 'Stage', 'Deal Value', 'Follow-up Date', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(l => [
        `"${l.name.replace(/"/g, '""')}"`,
        `"${l.phone_number || ''}"`,
        `"${l.service_needed}"`,
        `"${l.pipeline_stage}"`,
        l.deal_value || 0,
        l.follow_up_date || '',
        `"${(l.notes || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const getFollowUpStatus = (dateStr) => {
    if (!dateStr) return { color: 'text-gray-400', text: 'Unscheduled' };
    const date = parseISO(dateStr);
    const today = startOfToday();
    if (isBefore(date, today)) return { color: 'text-red-600 bg-red-50 px-2 py-0.5 rounded font-bold', text: format(date, 'MMM dd, yyyy') };
    if (isToday(date)) return { color: 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-bold', text: 'Today' };
    return { color: 'text-gray-600 font-medium', text: format(date, 'MMM dd, yyyy') };
  };

  if (loading) return <div className="text-[#026cfe] animate-pulse p-4">Loading leads...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold font-syne text-gray-900 tracking-tight">All Leads ({filteredLeads.length})</h1>
        <div className="flex items-center gap-2">
          <Link 
            to="/trash"
            className="flex items-center justify-center bg-white hover:bg-gray-50 border border-gray-200 text-gray-500 hover:text-red-500 w-10 h-10 rounded-lg transition-colors focus:ring-2 focus:ring-red-500/20"
            title="View Trash"
          >
            <Trash2 size={18} />
          </Link>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 shadow-sm text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors focus:ring-2 focus:ring-[#026cfe]/20"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search by name, phone, or service..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 shadow-sm rounded-xl pl-10 pr-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#026cfe] focus:ring-1 focus:ring-[#026cfe] transition-all"
          />
        </div>
        <div className="w-full md:w-64 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select 
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            className="w-full bg-white border border-gray-200 shadow-sm rounded-xl pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:border-[#026cfe] focus:ring-1 focus:ring-[#026cfe] appearance-none cursor-pointer"
          >
            <option value="All">All Stages</option>
            {pipelineStages.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
                <th className="p-4 px-6">Name & Phone</th>
                <th className="p-4">Service</th>
                <th className="p-4">Stage</th>
                <th className="p-4">Deal Value</th>
                <th className="p-4">Follow-up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeads.map(lead => {
                const followUp = getFollowUpStatus(lead.follow_up_date);
                return (
                  <tr 
                    key={lead.id} 
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                  >
                    <td className="p-4 px-6">
                      <div className="font-semibold text-gray-900 text-base group-hover:text-[#026cfe] transition-colors">{lead.name}</div>
                      <div className="text-sm text-gray-500 font-medium mt-0.5">{lead.phone_number || '-'}</div>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-600 bg-gray-50/50">
                      {lead.service_needed}
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center", 
                        stageColors[lead.pipeline_stage] || stageColors['New Lead']
                      )}>
                        {lead.pipeline_stage}
                      </span>
                    </td>
                    <td className="p-4 text-gray-900 font-semibold bg-gray-50/50">
                      {formatCurrency(lead.deal_value)}
                    </td>
                    <td className="p-4">
                      <span className={cn("text-sm inline-block", followUp.color)}>
                        {followUp.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
              
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-32 text-center bg-gray-50/30">
                    <div className="text-gray-400 font-medium mb-3">No leads match your search criteria.</div>
                    <button 
                      onClick={() => { setSearch(''); setStageFilter('All'); }}
                      className="text-[#026cfe] bg-blue-50 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition-colors"
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LeadDetailPanel 
        lead={selectedLead} 
        isOpen={!!selectedLead} 
        onClose={() => setSelectedLead(null)} 
      />
    </div>
  );
}
