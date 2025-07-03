import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './components/notifications/NotificationSystem'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Pages
import Home from './pages/Home'
import About from './pages/About'
import Programs from './pages/Programs'
import ProgramDetail from './pages/ProgramDetail'
import Dashboard from './pages/Dashboard'
import CoursePlayer from './pages/CoursePlayer'
import AdminDashboard from './pages/AdminDashboard'

// Community Components
import ForumList from './components/community/ForumList'
import PrayerWall from './components/community/PrayerWall'

// Coaching Components
import CoachingScheduler from './components/coaching/CoachingScheduler'

// Notification Components
import { NotificationSettings } from './components/notifications/NotificationSystem'

import './App.css'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Header />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/programs" element={<Programs />} />
                <Route path="/programs/:id" element={<ProgramDetail />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />

                <Route path="/course/:programId/:moduleId" element={
                  <ProtectedRoute>
                    <CoursePlayer />
                  </ProtectedRoute>
                } />

                {/* Community Routes */}
                <Route path="/community" element={
                  <ProtectedRoute>
                    <Navigate to="/community/forums" replace />
                  </ProtectedRoute>
                } />

                <Route path="/community/forums" element={
                  <ProtectedRoute>
                    <ForumList />
                  </ProtectedRoute>
                } />

                <Route path="/community/prayer-wall" element={
                  <ProtectedRoute>
                    <PrayerWall />
                  </ProtectedRoute>
                } />

                {/* Coaching Routes */}
                <Route path="/coaching" element={
                  <ProtectedRoute>
                    <CoachingScheduler />
                  </ProtectedRoute>
                } />

                {/* Settings Routes */}
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Navigate to="/settings/notifications" replace />
                  </ProtectedRoute>
                } />

                <Route path="/settings/notifications" element={
                  <ProtectedRoute>
                    <NotificationSettings />
                  </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App

