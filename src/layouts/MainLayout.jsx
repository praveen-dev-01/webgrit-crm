import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Kanban, CalendarClock, Plus, BarChart } from 'lucide-react';
import { useLeads } from '../context/LeadContext';
import { isToday, parseISO } from 'date-fns';
import { useState } from 'react';
import LeadModal from '../components/LeadModal';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/leads', label: 'All Leads', icon: Users },
  { path: '/pipeline', label: 'Pipeline', icon: Kanban },
  { path: '/follow-ups', label: 'Follow-ups', icon: CalendarClock },
  { path: '/analytics', label: 'Analytics', icon: BarChart },
];

export default function MainLayout() {
  const { leads } = useLeads();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate Due Today
  const dueTodayCount = leads.filter(l => l.follow_up_date && isToday(parseISO(l.follow_up_date))).length;

  return (
    <div className="flex h-screen bg-[#f8fafc] text-gray-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 bg-white">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold flex items-center gap-2 tracking-tight text-[#026cfe]">
            <span className="bg-[#026cfe] text-white rounded px-2 py-0.5 text-xl">CRM</span> Webgrit
          </h1>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive 
                    ? 'bg-[#026cfe]/10 text-[#026cfe]' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {item.path === '/follow-ups' && dueTodayCount > 0 && (
                  <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200">
                    {dueTodayCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f8fafc]">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-gray-200 bg-white shadow-sm">
          <div className="md:hidden">
            <h1 className="text-xl font-bold text-[#026cfe]">CRM Webgrit</h1>
          </div>
          <div className="flex-1"></div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#026cfe] hover:bg-[#0256cc] text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md shadow-[#026cfe]/20 border border-[#026cfe]/20"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Lead</span>
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth overflow-x-hidden">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white/90 backdrop-blur-lg pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center p-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-2 rounded-lg relative ${
                  isActive ? 'text-[#026cfe]' : 'text-gray-400'
                }`}
              >
                <Icon size={20} className="mb-1" />
                <span className="text-[10px] font-medium">{item.label}</span>
                {item.path === '/follow-ups' && dueTodayCount > 0 && (
                  <span className="absolute top-1 right-3 w-2.5 h-2.5 bg-amber-500 border border-white rounded-full shadow-sm"></span>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
