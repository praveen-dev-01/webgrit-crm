import { useLeads } from '../context/LeadContext';
import { formatCurrency, stageColors, pipelineStages } from '../lib/utils';
import { Users, TrendingUp, IndianRupee, Activity, Clock, AlertCircle } from 'lucide-react';
import { isToday, isBefore, startOfToday, parseISO } from 'date-fns';
import { useState } from 'react';
import LeadDetailPanel from '../components/LeadDetailPanel';

export default function Dashboard() {
  const { leads, loading, error } = useLeads();
  const [selectedLead, setSelectedLead] = useState(null);

  if (loading) return <div className="text-[#026cfe] animate-pulse p-4">Loading dashboard...</div>;
  if (error) return <div className="text-red-500 p-4 font-medium bg-red-50 border border-red-200 rounded-lg">Error: {error}</div>;

  const totalLeads = leads.length;
  const wonLeads = leads.filter(l => l.pipeline_stage === 'Won ✅');
  const wonClientsCount = wonLeads.length;
  const conversionRate = totalLeads ? ((wonClientsCount / totalLeads) * 100).toFixed(1) : 0;
  
  const revenueWon = wonLeads.reduce((acc, l) => acc + (Number(l.deal_value) || 0), 0);
  
  const pipelineValue = leads
    .filter(l => !['Won ✅', 'Lost ❌'].includes(l.pipeline_stage))
    .reduce((acc, l) => acc + (Number(l.deal_value) || 0), 0);
    
  // Revenue Forecasting: Deals close to winning
  const potentialRevenue = leads
    .filter(l => ['Proposal', 'Negotiating'].includes(l.pipeline_stage))
    .reduce((acc, l) => acc + (Number(l.deal_value) || 0), 0);

  const today = startOfToday();
  const actionableLeads = leads.filter(l => {
    if (!l.follow_up_date) return false;
    const date = parseISO(l.follow_up_date);
    return isBefore(date, today) || isToday(date);
  }).sort((a, b) => new Date(a.follow_up_date) - new Date(b.follow_up_date));

  const recentLeads = [...leads].slice(0, 5);

  const stats = [
    { label: 'Total Leads', value: totalLeads, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Won Clients', value: `${wonClientsCount} (${conversionRate}%)`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Revenue Won', value: formatCurrency(revenueWon), icon: IndianRupee, color: 'text-[#026cfe]', bg: 'bg-[#026cfe]/10' },
    { label: 'Pipeline Value', value: formatCurrency(pipelineValue), icon: Activity, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Forecast (Hot)', value: formatCurrency(potentialRevenue), icon: Activity, color: 'text-purple-600', bg: 'bg-purple-100' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-syne tracking-tight text-gray-900">Dashboard overview</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white border border-gray-200 shadow-sm p-6 rounded-2xl hover:border-gray-300 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon size={24} />
                </div>
                <div className="text-gray-500 font-medium text-sm">{stat.label}</div>
              </div>
              <div className="text-3xl font-bold text-gray-900 font-syne">{stat.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Due Today / Overdue */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-bold font-syne flex items-center gap-2 text-gray-900">
            <AlertCircle className="text-amber-500" /> Action Needed
          </h2>
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
            {actionableLeads.length === 0 ? (
              <div className="p-8 text-center text-gray-400 font-medium">All caught up! No follow-ups due today.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {actionableLeads.map(lead => {
                  const isPast = isBefore(parseISO(lead.follow_up_date), today);
                  return (
                    <li 
                      key={lead.id} 
                      onClick={() => setSelectedLead(lead)}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition flex items-start justify-between group"
                    >
                      <div>
                        <div className="font-semibold text-gray-900 group-hover:text-[#026cfe] transition-colors">{lead.name}</div>
                        <div className="text-sm font-semibold mt-1 flex items-center gap-1">
                          <Clock size={14} className={isPast ? "text-red-500" : "text-amber-500"} /> 
                          <span className={isPast ? "text-red-600" : "text-amber-600"}>{isPast ? 'Overdue' : 'Due Today'}</span>
                        </div>
                      </div>
                      <div className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">{lead.service_needed}</div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Leads Table */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold font-syne text-gray-900">Recent Leads</h2>
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs border-b border-gray-200">
                  <th className="p-4 font-bold uppercase tracking-wider">Client</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Service</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Stage</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentLeads.map(lead => (
                  <tr 
                    key={lead.id} 
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-gray-50 cursor-pointer transition"
                  >
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{lead.name}</div>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">{lead.service_needed}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${stageColors[lead.pipeline_stage] || stageColors['New Lead']}`}>
                        {lead.pipeline_stage}
                      </span>
                    </td>
                    <td className="p-4 text-gray-900 font-semibold">
                      {formatCurrency(lead.deal_value)}
                    </td>
                  </tr>
                ))}
                {recentLeads.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-gray-400 font-medium">
                      No leads added yet. Click "Add Lead" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
