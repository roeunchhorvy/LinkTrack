import { Routes, Route, Navigate } from 'react-router-dom';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CreateLink from './pages/CreateLink.jsx';
import LinkAnalytics from './pages/LinkAnalytics.jsx';
import LinkManagement from './pages/LinkManagement.jsx';
import NotFound from './pages/NotFound.jsx';
import Expired from './pages/Expired.jsx';

import AppLayout from './components/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/expired" element={<Expired />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<CreateLink />} />
        <Route path="/links" element={<LinkManagement />} />
        <Route path="/links/:id" element={<LinkAnalytics />} />
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
