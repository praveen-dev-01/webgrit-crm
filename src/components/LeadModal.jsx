import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLeads } from '../context/LeadContext';
import { serviceOptions, pipelineStages } from '../lib/utils';
import { cn } from '../lib/utils';

export default function LeadModal({ isOpen, onClose, initialData = null }) {
  const { addLead, updateLead } = useLeads();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    service_needed: serviceOptions[0],
    deal_value: 0,
    pipeline_stage: pipelineStages[0],
    follow_up_date: '',
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        deal_value: initialData.deal_value || 0,
        follow_up_date: initialData.follow_up_date || '',
      });
    } else {
      setFormData({
        name: '',
        phone_number: '',
        service_needed: serviceOptions[0],
        deal_value: 0,
        pipeline_stage: pipelineStages[0],
        follow_up_date: '',
        notes: '',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    let result;
    
    if (initialData?.id) {
      result = await updateLead(initialData.id, formData);
    } else {
      result = await addLead(formData);
    }

    setLoading(false);
    if (result.success) {
      onClose();
    } else {
      alert("Error saving lead: " + result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-white border border-gray-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold font-syne text-gray-900">
            {initialData ? 'Edit Lead' : 'Add New Lead'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700">Name <span className="text-red-500">*</span></label>
            <input 
              required
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-white border border-gray-300 shadow-sm rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#026cfe]/20 focus:border-[#026cfe] transition-all"
              placeholder="Client or Company Name"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Phone</label>
              <input 
                type="text"
                value={formData.phone_number}
                onChange={e => setFormData({...formData, phone_number: e.target.value})}
                className="w-full bg-white border border-gray-300 shadow-sm rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#026cfe]/20 focus:border-[#026cfe] transition-all"
                placeholder="+91..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Deal Value (₹)</label>
              <input 
                type="number"
                min="0"
                value={formData.deal_value}
                onChange={e => setFormData({...formData, deal_value: parseFloat(e.target.value) || 0})}
                className="w-full bg-white border border-gray-300 shadow-sm rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#026cfe]/20 focus:border-[#026cfe] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Service</label>
              <select 
                value={formData.service_needed}
                onChange={e => setFormData({...formData, service_needed: e.target.value})}
                className="w-full bg-white border border-gray-300 shadow-sm rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#026cfe]/20 focus:border-[#026cfe] cursor-pointer"
              >
                {serviceOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Pipeline Stage</label>
              <select 
                value={formData.pipeline_stage}
                onChange={e => setFormData({...formData, pipeline_stage: e.target.value})}
                className="w-full bg-white border border-gray-300 shadow-sm rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#026cfe]/20 focus:border-[#026cfe] cursor-pointer"
              >
                {pipelineStages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700">Follow-up Date</label>
            <input 
              type="date"
              value={formData.follow_up_date}
              onChange={e => setFormData({...formData, follow_up_date: e.target.value})}
              className="w-full bg-white border border-gray-300 shadow-sm rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#026cfe]/20 focus:border-[#026cfe]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700">Notes (From WhatsApp)</label>
            <textarea 
              rows={3}
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full bg-white border border-gray-300 shadow-sm rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#026cfe]/20 focus:border-[#026cfe] resize-none"
              placeholder="Key requirements discussed..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "px-5 py-2.5 rounded-lg font-bold bg-[#026cfe] text-white hover:bg-[#0256cc] transition-colors shadow-md shadow-[#026cfe]/20",
                loading && "opacity-70 cursor-not-allowed"
              )}
            >
              {loading ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Lead')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
