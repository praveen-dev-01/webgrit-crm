import { useState, useMemo } from 'react';
import { useLeads } from '../context/LeadContext';
import { isBefore, isToday, startOfToday, parseISO, format, addDays } from 'date-fns';
import { stageColors, cn } from '../lib/utils';
import { CalendarClock, AlertCircle, Clock, MessageCircle, CalendarPlus, CheckCircle2 } from 'lucide-react';
import LeadDetailPanel from '../components/LeadDetailPanel';

export default function FollowUps() {
  const { leads, loading, error, updateLead } = useLeads();
  const [selectedLead, setSelectedLead] = useState(null);

  const { overdue, todayLeads, upcoming } = useMemo(() => {
    const today = startOfToday();
    const categories = {
      overdue: [],
      todayLeads: [],
      upcoming: []
    };

    leads.forEach(lead => {
      if (!lead.follow_up_date) return;
      
      const date = parseISO(lead.follow_up_date);
      
      if (isBefore(date, today)) {
        categories.overdue.push(lead);
      } else if (isToday(date)) {
        categories.todayLeads.push(lead);
      } else {
        categories.upcoming.push(lead);
      }
    });

    // Sort ascending by date
    const sortByDate = (a, b) => new Date(a.follow_up_date) - new Date(b.follow_up_date);
    
    categories.overdue.sort(sortByDate);
    categories.todayLeads.sort(sortByDate);
    categories.upcoming.sort(sortByDate);

    return categories;
  }, [leads]);

  if (loading) return <div className="text-[#026cfe] animate-pulse p-4">Loading follow-ups...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  const handleReschedule = async (e, lead, days) => {
    e.stopPropagation();
    const newDate = addDays(startOfToday(), days);
    await updateLead(lead.id, { follow_up_date: format(newDate, 'yyyy-MM-dd') });
  };

  const handleMarkStage = async (e, lead, stage) => {
    e.stopPropagation();
    await updateLead(lead.id, { pipeline_stage: stage });
  };

  const renderSection = (title, items, icon, colorClass, borderClass, emptyMsg, bgClass) => (
    <div className={`rounded-2xl border ${borderClass} bg-white shadow-sm overflow-hidden mb-8`}>
      <div className={`p-5 border-b ${borderClass} flex items-center gap-2 ${bgClass}`}>
        {icon}
        <h2 className={`text-xl font-bold font-syne ${colorClass}`}>
          {title} ({items.length})
        </h2>
      </div>
      
      {items.length === 0 ? (
        <div className="p-8 text-center text-gray-500 font-medium">{emptyMsg}</div>
      ) : (
        <ul className={`divide-y divide-gray-100`}>
          {items.map(lead => (
            <li 
              key={lead.id} 
              onClick={() => setSelectedLead(lead)}
              className="p-5 hover:bg-gray-50 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div>
                <div className="font-semibold text-gray-900 text-lg group-hover:text-[#026cfe] transition flex items-center gap-2">
                  {lead.name}
                </div>
                <div className="text-sm text-gray-500 font-medium mt-1 flex flex-wrap items-center gap-2">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{lead.service_needed}</span>
                  {lead.phone_number && <span className="">{lead.phone_number}</span>}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                
                {/* Quick Actions - Always visible on mobile, visible on hover for desktop */}
                <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  {lead.phone_number && (
                    <a 
                      href={`https://wa.me/${lead.phone_number?.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#25D366] bg-[#25D366]/10 rounded-lg hover:bg-[#25D366]/20 transition"
                      title="Open WhatsApp"
                    >
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                  )}
                  <button 
                    onClick={(e) => handleReschedule(e, lead, 1)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition"
                    title="Move Follow-up to Tomorrow"
                  >
                    <CalendarPlus size={14} /> +1 Day
                  </button>
                  {lead.pipeline_stage === 'New Lead' && (
                    <button 
                      onClick={(e) => handleMarkStage(e, lead, 'Contacted')}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-600 bg-purple-100 rounded-lg hover:bg-purple-200 transition"
                      title="Mark stage as Contacted"
                    >
                      <CheckCircle2 size={14} /> Contacted
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-gray-200 pt-3 sm:pt-0 sm:pl-4 mt-2 sm:mt-0">
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center",
                    stageColors[lead.pipeline_stage] || stageColors["New Lead"]
                  )}>
                    {lead.pipeline_stage}
                  </span>
                  <span className="text-sm font-semibold text-gray-500 w-24 text-right">
                    {format(parseISO(lead.follow_up_date), 'MMM dd, yyyy')}
                  </span>
                </div>

              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-syne text-gray-900 tracking-tight">Follow-ups Schedule</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage scheduled touchpoints and use quick actions to update progress.</p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {renderSection(
          "Overdue",
          overdue,
          <AlertCircle className="text-red-600" size={24} />,
          "text-red-700",
          "border-red-200",
          "Great job! No overdue follow-ups.",
          "bg-red-50"
        )}

        {renderSection(
          "Due Today",
          todayLeads,
          <Clock className="text-amber-600" size={24} />,
          "text-amber-700",
          "border-amber-200",
          "No follow-ups scheduled for today.",
          "bg-amber-50"
        )}

        {renderSection(
          "Upcoming",
          upcoming,
          <CalendarClock className="text-[#026cfe]" size={24} />,
          "text-[#026cfe]",
          "border-blue-200",
          "No upcoming follow-ups scheduled.",
          "bg-blue-50"
        )}
      </div>

      <LeadDetailPanel 
        lead={selectedLead} 
        isOpen={!!selectedLead} 
        onClose={() => setSelectedLead(null)} 
      />
    </div>
  );
}
