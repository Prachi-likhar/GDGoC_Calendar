import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';
import RoleGate from './components/layout/RoleGate.jsx';
import Analytics from './pages/Analytics.jsx';
import BlockedDates from './pages/BlockedDates.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import CheckIn from './pages/CheckIn.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EventCreate from './pages/EventCreate.jsx';
import EventDetail from './pages/EventDetail.jsx';
import LiveView from './pages/LiveView.jsx';
import Login from './pages/Login.jsx';
import MyTasks from './pages/MyTasks.jsx';
import Profile from './pages/Profile.jsx';
import FeedbackForm from './pages/public/FeedbackForm.jsx';
import PublicEventPage from './pages/public/PublicEventPage.jsx';
import PublicEvents from './pages/public/PublicEvents.jsx';
import Team from './pages/Team.jsx';
import Templates from './pages/Templates.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/e" element={<PublicEvents />} />
              <Route path="/e/:slug" element={<PublicEventPage />} />
              <Route path="/e/:slug/feedback" element={<FeedbackForm />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/events/:id/live" element={<LiveView />} />
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/events/:id" element={<EventDetail />} />
                  <Route path="/tasks" element={<MyTasks />} />
                  <Route path="/profile" element={<Profile />} />

                  <Route element={<RoleGate allowed={['admin', 'domain_head']} />}>
                    <Route path="/events/new" element={<EventCreate />} />
                    <Route path="/events/:id/edit" element={<EventCreate />} />
                    <Route path="/events/:id/checkin" element={<CheckIn />} />
                    <Route path="/analytics" element={<Analytics />} />
                  </Route>

                  <Route element={<RoleGate allowed={['admin']} />}>
                    <Route path="/templates" element={<Templates />} />
                    <Route path="/blocked-dates" element={<BlockedDates />} />
                    <Route path="/team" element={<Team />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
