import { useState } from 'react';
import { useLeads } from '../context/LeadContext';
import { pipelineStages, stageColors, formatCurrency, cn } from '../lib/utils';
import LeadDetailPanel from '../components/LeadDetailPanel';

export default function Pipeline() {
  const { leads, loading, error } = useLeads();
  const [selectedLead, setSelectedLead] = useState(null);

  if (loading) return <div className="text-[#026cfe] animate-pulse p-4">Loading pipeline...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  return (
    <div className="h-full flex flex-col space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      
      <div className="flex-none">
        <h1 className="text-3xl font-bold font-syne text-gray-900 tracking-tight">Pipeline Board</h1>
        <p className="text-gray-500 font-medium mt-2">Manage your leads across {pipelineStages.length} stages.</p>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 flex gap-6 overflow-x-auto pb-6 custom-scrollbar snap-x snap-mandatory">
        
        {pipelineStages.map((stage) => {
          const stageLeads = leads.filter(l => l.pipeline_stage === stage);
          const stageValue = stageLeads.reduce((acc, l) => acc + (Number(l.deal_value) || 0), 0);
          
          const colorClass = stageColors[stage] || stageColors['New Lead'];
          const stripColor = colorClass.split(' ').find(c => c.startsWith('bg-'))?.replace('-100', '-500') || 'bg-[#026cfe]';

          return (
            <div 
              key={stage} 
              className="flex-none w-[320px] bg-gray-50/50 rounded-2xl flex flex-col snap-center border border-gray-200/60 shadow-inner max-h-full"
            >
              
              {/* Column Header */}
              <div className="p-4 border-b border-gray-200/60 flex items-center justify-between sticky top-0 bg-gray-50/90 backdrop-blur-sm rounded-t-2xl z-10">
                <div className="flex items-center gap-3">
                  <div className="font-syne font-bold text-gray-800 tracking-wide">
                    {stage}
                  </div>
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-full border bg-white",
                    colorClass.split(' ').filter(c => !c.startsWith('bg-'))
                  )}>
                    {stageLeads.length}
                  </span>
                </div>
              </div>

              {/* Cards Wrapper */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar min-h-[200px]">
                {stageLeads.map(lead => (
                  <div 
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="bg-white hover:bg-slate-50 p-4 rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer transition-all shadow-sm hover:shadow-md group relative overflow-hidden"
                  >
                    {/* Hover indicator strip */}
                    <div className={cn(
                      "absolute left-0 top-0 bottom-0 w-1 opacity-10 group-hover:opacity-100 transition-opacity",
                      stripColor
                    )}></div>
                    
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-[#026cfe] transition-colors pl-2">{lead.name}</h3>
                    <div className="text-xs text-gray-500 font-semibold mb-3 pl-2">{lead.service_needed}</div>
                    
                    <div className="flex items-center justify-between mt-auto pl-2 bg-gray-50 -mx-4 -mb-4 p-3 border-t border-gray-100 group-hover:bg-slate-100 transition-colors">
                      <span className="text-sm font-bold text-gray-700">
                        {formatCurrency(lead.deal_value)}
                      </span>
                      {lead.follow_up_date && (
                        <span className="text-[10px] uppercase font-bold text-gray-500 bg-white border border-gray-200 shadow-sm px-2 py-1 rounded">
                          {lead.follow_up_date.slice(5)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {stageLeads.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-400 font-medium border-2 border-dashed border-gray-200 rounded-xl bg-white/50">
                    <p className="text-sm">No leads in {stage}</p>
                  </div>
                )}
              </div>

              {/* Column Footer */}
              <div className="p-4 border-t border-gray-200/60 bg-white rounded-b-2xl mt-auto sticky bottom-0 text-center shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">
                  Total Value
                </div>
                <div className="text-[#026cfe] font-bold text-lg">
                  {formatCurrency(stageValue)}
                </div>
              </div>
              
            </div>
          );
        })}
        
      </div>

      <LeadDetailPanel 
        lead={selectedLead} 
        isOpen={!!selectedLead} 
        onClose={() => setSelectedLead(null)} 
      />

    </div>
  );
}
