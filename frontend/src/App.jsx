import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Lazy loading or direct imports - direct for simplicity
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ProfileForm from './pages/Profile/ProfileForm';
import MatchesFeed from './pages/Matches/MatchesFeed';
import ProjectsList from './pages/Projects/ProjectsList';
import Chat from './pages/Chat/Chat';
import Notifications from './pages/Notifications/Notifications';
import AdminDashboard from './pages/Admin/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <Navbar />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfileForm />
                  </ProtectedRoute>
                } />

                <Route path="/" element={
                  <ProtectedRoute>
                    <MatchesFeed />
                  </ProtectedRoute>
                } />

                <Route path="/projects" element={
                  <ProtectedRoute>
                    <ProjectsList />
                  </ProtectedRoute>
                } />

                <Route path="/chat" element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } />

                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                } />

                <Route path="/admin" element={
                  <ProtectedRoute roleRequired="ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
