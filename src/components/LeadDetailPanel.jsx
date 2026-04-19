import { useState } from 'react';
import { X, Edit2, Trash2, Calendar, IndianRupee, MessageCircle, Clock, Flame } from 'lucide-react';
import { useLeads } from '../context/LeadContext';
import { pipelineStages, stageColors, formatCurrency, cn, calculateLeadScore } from '../lib/utils';
import { format, parseISO } from 'date-fns';
import LeadModal from './LeadModal';

export default function LeadDetailPanel({ lead, isOpen, onClose }) {
  const { updateLead, deleteLead } = useLeads();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [quickStage, setQuickStage] = useState(lead?.pipeline_stage);
  const [isSaving, setIsSaving] = useState(false);

  // Sync quick stage if lead changes
  if (lead && lead.pipeline_stage !== quickStage && !isSaving) {
    setQuickStage(lead.pipeline_stage);
  }

  if (!isOpen || !lead) return null;

  const handleStageChange = async (e) => {
    const newStage = e.target.value;
    setQuickStage(newStage);
    setIsSaving(true);
    await updateLead(lead.id, { pipeline_stage: newStage });
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${lead.name}?`)) {
      await deleteLead(lead.id);
      onClose();
    }
  };

  const formattedDateAdded = lead.created_at 
    ? format(new Date(lead.created_at), 'MMM dd, yyyy')
    : 'Unknown';

  const formattedFollowUp = lead.follow_up_date
    ? format(parseISO(lead.follow_up_date), 'MMM dd, yyyy')
    : 'No Date Set';

  const score = calculateLeadScore(lead);
  const isHot = score > 60;

  return (
    <>
      <div 
        className="fixed inset-0 bg-gray-900/60 z-40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className={cn(
        "fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 flex flex-col pt-safe",
        isHot && "ring-4 ring-orange-500/20 border-l-orange-500"
      )}>
        
        {/* Header */}
        <div className="flex-none p-6 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-bold font-syne text-gray-900 mb-2">{lead.name}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn(
                "px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center",
                stageColors[quickStage] || stageColors["New Lead"]
              )}>
                {quickStage}
              </span>
              
              <span className={cn(
                "px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1",
                isHot ? "bg-orange-100 text-orange-700 border-orange-200" : "bg-gray-100 text-gray-600 border-gray-200"
              )}>
                <Flame size={14} className={isHot ? "text-orange-500" : "text-gray-400"} />
                Score: {score}
              </span>

              <a 
                href={`https://wa.me/${lead.phone_number?.replace(/[^0-9]/g, '')}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-[#25D366] bg-[#25D366]/10 px-2.5 py-1 rounded-full text-xs font-bold hover:bg-[#25D366]/20 transition flex items-center gap-1"
                onClick={e => !lead.phone_number && e.preventDefault()}
                title={lead.phone_number ? `Chat with ${lead.phone_number}` : 'No phone number'}
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Quick Actions / Updates */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Update Stage</label>
              <select 
                value={quickStage}
                onChange={handleStageChange}
                disabled={isSaving}
                className="w-full bg-white border border-gray-300 shadow-sm rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#026cfe]/20 focus:border-[#026cfe] transition-all cursor-pointer font-medium"
              >
                {pipelineStages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="text-gray-500 flex items-center gap-2 text-sm font-semibold mb-1">
                <IndianRupee size={16} /> Deal Value
              </div>
              <div className="text-xl font-bold text-gray-900">
                {formatCurrency(lead.deal_value)}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="text-gray-500 flex items-center gap-2 text-sm font-semibold mb-1">
                <Calendar size={16} /> Follow-up
              </div>
              <div className="text-base font-bold text-gray-900 tracking-tight">
                {formattedFollowUp}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-syne font-bold text-gray-900">Details</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500 font-semibold text-sm">Service Needed</span>
                <span className="text-gray-900 font-bold text-sm">{lead.service_needed}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500 font-semibold text-sm">Phone Number</span>
                <span className="text-gray-900 font-bold text-sm">{lead.phone_number || '-'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500 font-semibold text-sm flex items-center gap-1">
                  <Clock size={14} /> Added
                </span>
                <span className="text-gray-900 font-bold text-sm">{formattedDateAdded}</span>
              </div>
            </div>
          </div>

          {lead.notes && (
            <div className="space-y-2">
              <h3 className="text-xs text-gray-500 uppercase font-bold tracking-wider">Notes</h3>
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-gray-700 font-medium text-sm whitespace-pre-wrap leading-relaxed shadow-sm">
                {lead.notes}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex-none p-6 border-t border-gray-200 bg-gray-50 grid grid-cols-2 gap-3 pb-safe">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 py-3 rounded-lg font-bold transition-colors border border-gray-300 shadow-sm"
          >
            <Edit2 size={18} /> Edit
          </button>
          <button 
            onClick={handleDelete}
            className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-lg font-bold transition-colors border border-red-200 shadow-sm"
          >
            <Trash2 size={18} /> Delete
          </button>
        </div>
      </div>
      
      {isEditModalOpen && (
        <LeadModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          initialData={lead} 
        />
      )}
    </>
  );
}
