import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import MainLayout from './components/Layout/MainLayout';
import AdminLayout from './components/Layout/AdminLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import PetListPage from './pages/Pet/PetListPage';
import PetDetailPage from './pages/Pet/PetDetailPage';
import PetSubmissionPage from './pages/Pet/PetSubmissionPage';
import MyPetSubmissionsPage from './pages/Pet/MyPetSubmissionsPage';
import AdoptionListPage from './pages/Adoption/AdoptionListPage';
import LostPetListPage from './pages/LostPet/LostPetListPage';
import MyLostPetPage from './pages/LostPet/MyLostPetPage';
import ForumPage from './pages/Forum/ForumPage';
import ForumDetailPage from './pages/Forum/ForumDetailPage';
import MyForumPostsPage from './pages/Forum/MyForumPostsPage';
import DashboardPage from './pages/Admin/DashboardPage';
import AdminPlaceholderPage from './pages/Admin/AdminPlaceholderPage';
import AdoptionManagementPage from './pages/Admin/AdoptionManagementPage';
import PetSubmissionReviewPage from './pages/Admin/PetSubmissionReviewPage';
import PetManagementPage from './pages/Admin/PetManagementPage';
import AnnouncementPage from './pages/Admin/AnnouncementPage';
import LostPetManagementPage from './pages/Admin/LostPetManagementPage';
import ForumManagementPage from './pages/Admin/ForumManagementPage';
import AdminAccountPage from './pages/Admin/AdminAccountPage';
import UserManagementPage from './pages/Admin/UserManagementPage';
import ProfilePage from './pages/User/ProfilePage';
import MyPetProfilesPage from './pages/User/MyPetProfilesPage';
import NotificationPage from './pages/Notification/NotificationPage';
import BoardingApplicationPage from './pages/Boarding/BoardingApplicationPage';
import MyBoardingListPage from './pages/Boarding/MyBoardingListPage';
import BoardingManagementPage from './pages/Admin/BoardingManagementPage';
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
              <Route path="pet-submissions/new" element={
                <ProtectedRoute>
                  <PetSubmissionPage />
                </ProtectedRoute>
              } />
              <Route path="my-pet-submissions" element={
                <ProtectedRoute>
                  <MyPetSubmissionsPage />
                </ProtectedRoute>
              } />
              <Route path="lost-pets" element={<LostPetListPage />} />
              <Route path="my-lost-pets" element={
                <ProtectedRoute>
                  <MyLostPetPage />
                </ProtectedRoute>
              } />
              <Route path="forum" element={<ForumPage />} />
              <Route path="forum/:id" element={<ForumDetailPage />} />
              <Route path="my-forum-posts" element={
                <ProtectedRoute>
                  <MyForumPostsPage />
                </ProtectedRoute>
              } />
              <Route path="profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="my-pets" element={
                <ProtectedRoute>
                  <MyPetProfilesPage />
                </ProtectedRoute>
              } />
              <Route path="boarding/apply" element={
                <ProtectedRoute>
                  <BoardingApplicationPage />
                </ProtectedRoute>
              } />
              <Route path="boarding" element={
                <ProtectedRoute>
                  <MyBoardingListPage />
                </ProtectedRoute>
              } />
              <Route path="notifications" element={
                <ProtectedRoute>
                  <NotificationPage />
                </ProtectedRoute>
              } />
            </Route>

            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="pets" element={<PetManagementPage />} />
              <Route path="pet-submissions" element={<PetSubmissionReviewPage />} />
              <Route path="adoptions" element={<AdoptionManagementPage />} />
              <Route path="announcements" element={<AnnouncementPage />} />
              <Route path="lost-pets" element={<LostPetManagementPage />} />
              <Route path="boarding" element={<BoardingManagementPage />} />
              <Route path="forum" element={<ForumManagementPage />} />
              <Route path="notifications" element={<AdminPlaceholderPage title="消息通知管理" />} />
              <Route path="admin-accounts" element={<AdminAccountPage />} />
              <Route path="users" element={<UserManagementPage />} />
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
