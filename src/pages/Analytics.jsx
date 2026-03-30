import { useMemo } from 'react';
import { useLeads } from '../context/LeadContext';
import { serviceOptions, pipelineStages, formatCurrency } from '../lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';

// Complementary modern colors built around the #026cfe primary brand
const COLORS = ['#026cfe', '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];

export default function Analytics() {
  const { leads, loading, error } = useLeads();

  // Aggregate Data
  const { pipelineData, serviceData, revenueData, winLossData } = useMemo(() => {
    // 1. Pipeline Stages Count
    const pData = pipelineStages.map(stage => ({
      name: stage,
      count: leads.filter(l => l.pipeline_stage === stage).length
    }));

    // 2. Leads by Service Count
    const sData = serviceOptions.map(service => ({
      name: service,
      value: leads.filter(l => l.service_needed === service).length
    })).filter(s => s.value > 0); // Only show relevant slices

    // 3. Revenue by Service Sum
    const rData = serviceOptions.map(service => {
      const serviceLeads = leads.filter(l => l.service_needed === service);
      const totalValue = serviceLeads.reduce((acc, l) => acc + (Number(l.deal_value) || 0), 0);
      return {
        name: service,
        revenue: totalValue
      };
    }).filter(r => r.revenue > 0);

    // 4. Win/Loss Ratio
    const wonCount = leads.filter(l => l.pipeline_stage === 'Won ✅').length;
    const lostCount = leads.filter(l => l.pipeline_stage === 'Lost ❌').length;
    const wlData = [
      { name: 'Won', value: wonCount },
      { name: 'Lost', value: lostCount }
    ].filter(w => w.value > 0);

    return { pipelineData: pData, serviceData: sData, revenueData: rData, winLossData: wlData };
  }, [leads]);

  if (loading) return <div className="text-[#026cfe] animate-pulse p-4">Loading analytics...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  const CustomTooltipCurrency = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 p-3 shadow-md rounded-lg">
          <p className="font-bold text-gray-900">{label}</p>
          <p className="text-[#026cfe] font-semibold">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipCount = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 p-3 shadow-md rounded-lg">
          <p className="font-bold text-gray-900 mb-1">{label || payload[0].name}</p>
          <p className="text-[#026cfe] font-semibold text-sm">
            Total count: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-syne text-gray-900 tracking-tight">Analytics Overview</h1>
          <p className="text-gray-500 font-medium mt-1">Visualize your agency's pipeline and revenue data.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        
        {/* 1. Leads by Service Pie Chart */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-bold font-syne text-gray-900 mb-4">Lead Source Distribution</h2>
          <div className="h-[300px] w-full">
            {serviceData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 font-medium">Not enough data to graph</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    innerRadius={60} // Donut style
                    paddingAngle={5}
                  >
                    {serviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltipCount />} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 2. Pipeline Stages Bar Chart */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-bold font-syne text-gray-900 mb-4">Pipeline Distribution</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#9ca3af" axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} stroke="#9ca3af" axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} content={<CustomTooltipCount />} />
                <Bar dataKey="count" fill="#026cfe" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Revenue Potential by Service */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-bold font-syne text-gray-900 mb-4">Revenue Potential by Source</h2>
          <div className="h-[300px] w-full">
            {revenueData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 font-medium">Not enough data to graph</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#9ca3af" axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#6b7280" tick={{fontSize: 12, fontWeight: 500}} axisLine={false} tickLine={false} width={100} />
                  <Tooltip cursor={{fill: '#f8fafc'}} content={<CustomTooltipCurrency />} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 4. Win / Loss Ratio */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-bold font-syne text-gray-900 mb-4">Win/Loss Ratio</h2>
          <div className="h-[300px] w-full">
            {winLossData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 font-medium">Resolve deals to see win/loss ratio</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={winLossData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {winLossData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'Won' ? '#10b981' : '#f43f5e'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltipCount />} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
