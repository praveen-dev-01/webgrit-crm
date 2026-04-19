import { useState } from 'react';
import { useLeads } from '../context/LeadContext';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  parseISO 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import LeadDetailPanel from '../components/LeadDetailPanel';

export default function CalendarView() {
  const { leads, loading, error } = useLeads();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedLead, setSelectedLead] = useState(null);

  if (loading) return <div className="text-[#026cfe] animate-pulse p-4">Loading calendar...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "MMMM yyyy";

  // Map leads by date
  const leadsByDate = leads.reduce((acc, lead) => {
    if (!lead.follow_up_date) return acc;
    const dateKey = format(parseISO(lead.follow_up_date), 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(lead);
    return acc;
  }, {});

  const renderDays = () => {
    const days = [];
    const dateFormat = "EEEE";
    let startDate = startOfWeek(currentDate);
    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="text-center font-bold text-sm text-gray-500 uppercase tracking-widest py-3 border-b border-gray-100" key={i}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }
    return <div className="grid grid-cols-7 bg-white">{days}</div>;
  };

  const renderCells = () => {
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        const dateKey = format(day, 'yyyy-MM-dd');
        const dayLeads = leadsByDate[dateKey] || [];

        days.push(
          <div
            className={`min-h-[120px] p-2 border-r border-b border-gray-100 transition-colors ${
              !isSameMonth(day, monthStart)
                ? "bg-gray-50/50 text-gray-300"
                : isSameDay(day, new Date())
                ? "bg-blue-50/50 text-[#026cfe] font-bold"
                : "bg-white hover:bg-gray-50 text-gray-700"
            }`}
            key={day}
          >
            <div className="flex justify-end pr-1">
              <span className={`text-sm ${isSameDay(day, new Date()) ? 'bg-[#026cfe] text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>
                {formattedDate}
              </span>
            </div>
            <div className="mt-2 space-y-1">
              {dayLeads.map(lead => (
                <div 
                  key={lead.id}
                  onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); }}
                  className="bg-white border border-gray-200 text-xs px-2 py-1.5 rounded-lg shadow-sm cursor-pointer hover:border-[#026cfe] hover:text-[#026cfe] transition-all truncate flex items-center gap-1.5 font-medium"
                >
                  <Clock size={10} className="text-gray-400" />
                  <span className="truncate">{lead.name}</span>
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="bg-white border-l border-t border-gray-100">{rows}</div>;
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-syne text-gray-900 tracking-tight">Calendar</h1>
          <p className="text-gray-500 font-medium mt-2">Manage your upcoming follow-ups and meetings.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white border border-gray-200 shadow-sm rounded-xl p-1">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-600">
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold font-syne text-gray-900 min-w-[140px] text-center">
            {format(currentDate, dateFormat)}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-600">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden flex flex-col">
        {renderDays()}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {renderCells()}
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
