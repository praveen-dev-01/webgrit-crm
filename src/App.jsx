import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import OneSignal from 'react-onesignal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LeadProvider } from './context/LeadContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import AllLeads from './pages/AllLeads';
import Pipeline from './pages/Pipeline';
import FollowUps from './pages/FollowUps';
import Analytics from './pages/Analytics';
import Trash from './pages/Trash';
import Login from './pages/Login'; // NEW
import CalendarView from './pages/CalendarView'; // NEW

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // or a loading spinner
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return children;
}

function App() {
  useEffect(() => {
    const initOneSignal = async () => {
      try {
        const appId = import.meta.env.VITE_ONESIGNAL_APP_ID || "YOUR_ONESIGNAL_APP_ID_HERE";
        if (appId && appId !== "YOUR_ONESIGNAL_APP_ID_HERE") {
          await OneSignal.init({
            appId,
            safari_web_id: "web.onesignal.auto.34f3144b-3497-4c5c-a43c-a5d9eb9bdd56",
            allowLocalhostAsSecureOrigin: true,
            notifyButton: {
              enable: true,
            },
          });
        } else {
          console.warn("OneSignal App ID is not configured. Push notifications are disabled.");
        }
      } catch (e) {
        console.error("OneSignal initialization failed", e);
      }
    };
    initOneSignal();
  }, []);

  return (
    <AuthProvider>
      <LeadProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="leads" element={<AllLeads />} />
              <Route path="pipeline" element={<Pipeline />} />
              <Route path="calendar" element={<CalendarView />} />
              <Route path="follow-ups" element={<FollowUps />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="trash" element={<Trash />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LeadProvider>
    </AuthProvider>
  );
}

export default App;
