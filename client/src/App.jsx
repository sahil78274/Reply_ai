import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { DesktopSidebar, MobileSidebar } from './components/layout/Sidebar.jsx';
import { Header } from './components/layout/Header.jsx';
import { ToastProvider } from './components/ui/ToastProvider.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Inbox from './pages/Inbox.jsx';
import Customers from './pages/Customers.jsx';
import Knowledge from './pages/Knowledge.jsx';
import Settings from './pages/Settings.jsx';
import AIAssistant from './pages/AIAssistant.jsx';
import LeadsCRM from './pages/LeadsCRM.jsx';
import AITraining from './pages/AITraining.jsx';
import AutomationWorkflows from './pages/AutomationWorkflows.jsx';
import BroadcastCampaigns from './pages/BroadcastCampaigns.jsx';
import Analytics from './pages/Analytics.jsx';
import Notifications from './pages/Notifications.jsx';
import Integrations from './pages/Integrations.jsx';
import TeamManagement from './pages/TeamManagement.jsx';

const PublicRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<Navigate to="/login" replace />} />
  </Routes>
);

const ProtectedLayout = ({ children }) => {
  const { user, token, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading || !mounted) return null;

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex-1 relative">
        <DesktopSidebar />
        <MobileSidebar />
        <main className="lg:pl-64 lg:pr-80 lg:pt-14 pt-14 pb-4 overflow-y-auto lg:overflow-y-visible">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/inbox" element={<Inbox />} />
    <Route path="/inbox/:conversationId" element={<Inbox />} />
    <Route path="/customers" element={<Customers />} />
    <Route path="/knowledge" element={<Knowledge />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/ai-assistant" element={<AIAssistant />} />
    <Route path="/leads" element={<LeadsCRM />} />
    <Route path="/ai-training" element={<AITraining />} />
    <Route path="/automation" element={<AutomationWorkflows />} />
    <Route path="/broadcast" element={<BroadcastCampaigns />} />
    <Route path="/analytics" element={<Analytics />} />
    <Route path="/notifications" element={<Notifications />} />
    <Route path="/integrations" element={<Integrations />} />
    <Route path="/team" element={<TeamManagement />} />
  </Routes>
);

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        {(() => {
          const token = localStorage.getItem('ra_token');
          return token ? (
            <SocketProvider token={token}>
              <ToastProvider />
              <ProtectedLayout>
                <AppRoutes />
              </ProtectedLayout>
            </SocketProvider>
          ) : (
            <PublicRoutes />
          );
        })()}
      </ThemeProvider>
    </AuthProvider>
  );
}
