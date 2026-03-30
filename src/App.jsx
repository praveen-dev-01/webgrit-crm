import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LeadProvider } from './context/LeadContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import AllLeads from './pages/AllLeads';
import Pipeline from './pages/Pipeline';
import FollowUps from './pages/FollowUps';
import Analytics from './pages/Analytics';
import Trash from './pages/Trash';

function App() {
  return (
    <LeadProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="leads" element={<AllLeads />} />
            <Route path="pipeline" element={<Pipeline />} />
            <Route path="follow-ups" element={<FollowUps />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="trash" element={<Trash />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LeadProvider>
  );
}

export default App;
