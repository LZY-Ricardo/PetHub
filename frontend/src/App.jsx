import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Layout } from 'antd';
import MainLayout from './components/Layout/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import PetListPage from './pages/Pet/PetListPage';
import PetDetailPage from './pages/Pet/PetDetailPage';
import AdoptionListPage from './pages/Adoption/AdoptionListPage';
import LostPetListPage from './pages/LostPet/LostPetListPage';
import ForumPage from './pages/Forum/ForumPage';
import ForumDetailPage from './pages/Forum/ForumDetailPage';
import DashboardPage from './pages/Admin/DashboardPage';
import ProfilePage from './pages/User/ProfilePage';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <ConfigProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes without layout */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Routes with layout */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="pets" element={<PetListPage />} />
              <Route path="pets/:id" element={<PetDetailPage />} />
              <Route path="adoptions" element={
                <ProtectedRoute>
                  <AdoptionListPage />
                </ProtectedRoute>
              } />
              <Route path="lost-pets" element={<LostPetListPage />} />
              <Route path="forum" element={<ForumPage />} />
              <Route path="forum/:id" element={<ForumDetailPage />} />
              <Route path="profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="admin/dashboard" element={
                <ProtectedRoute requireAdmin>
                  <DashboardPage />
                </ProtectedRoute>
              } />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
