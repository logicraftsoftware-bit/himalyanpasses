import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';

import Dashboard from './pages/dashboard/Dashboard';

import Sliders from './pages/admin/ManageSliders.jsx';
import ManageAnnouncements from './pages/admin/ManageAnnouncements.jsx';
import CustomerStories from './pages/CustomerStories.jsx';
import Certificate from './pages/admin/Certificates.jsx';
import FAQs from './pages/FAQs.jsx';
import BlogsSettings from './pages/BlogsSettings.jsx';
import SiteSettings from './pages/SiteSettings.jsx';
import AboutUsSettings from './pages/AboutUsSettings.jsx';
import Policies from './pages/Policies.jsx';
import PageMetaSettings from './pages/PageMetaSettings.jsx';
import BookingList from './pages/bookings/BookingList.jsx';
import Customers from './pages/admin/Customers.jsx';
import Additionals from './pages/admin/Additionals.jsx';
import PackagesList from './pages/admin/PackagesList.jsx';
import PackageDetails from './pages/admin/PackageDetails.jsx';
import CategoryList from './pages/admin/CategoryList.jsx';
import CategoryDetails from './pages/admin/CategoryDetails.jsx';
import MoreTreks from './pages/admin/MoreTreks.jsx';
import ContactUs from './pages/ContactUs.jsx';
import ContactSubmissions from './pages/admin/ContactSubmissions.jsx';
import AboutUsSections from './pages/AboutUsSections.jsx';
import PackageEnquiries from './pages/admin/PackageEnquiries.jsx';
import Enquiry from './pages/admin/Enquiry.jsx';
import Profile from './pages/settings/Profile.jsx';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Public Route Component (redirects to dashboard if already logged in)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      <Route path="/contact-us" element={<ContactUs />} />

      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Sliders & Homepage */}
        <Route path="sliders" element={<Sliders />} />
        <Route path="announcement" element={<ManageAnnouncements />} />
        <Route path="customer-stories" element={<CustomerStories />} />
        <Route path="testimonials" element={<Navigate to="/customer-stories" replace />} />
        <Route path="certificates" element={<Certificate />} />
        <Route path="faqs" element={<FAQs />} />

        {/* Content Settings */}
        <Route path="site-settings" element={<SiteSettings />} />
        <Route path="seo-settings" element={<PageMetaSettings />} />
        <Route path="about-us" element={<AboutUsSettings />} />
        <Route path="about-us-sections" element={<AboutUsSections />} />
        <Route path="policies" element={<Policies />} />
        <Route path="blogs-settings" element={<BlogsSettings />} />

        {/* Enquiries & Contact */}
        <Route path="enquiry" element={<Enquiry />} />
        <Route path="package-enquiries" element={<PackageEnquiries />} />
        <Route path="contacts" element={<ContactSubmissions />} />

        {/* Bookings & Customers */}
        <Route path="bookings" element={<BookingList />} />
        <Route path="customers" element={<Customers />} />

        {/* Package Management */}
        <Route path="packages" element={<PackagesList />} />
        <Route path="dashboard/packages/:id" element={<PackageDetails />} />
        <Route path="packages/:id" element={<PackageDetails />} />

        {/* Category Management */}
        <Route path="categories" element={<CategoryList />} />
        <Route path="dashboard/categories" element={<CategoryList />} />
        <Route path="dashboard/categories/:id" element={<CategoryDetails />} />
        <Route path="categories/:id" element={<CategoryDetails />} />

        {/* More Treks & Additionals */}
        <Route path="more-treks" element={<MoreTreks />} />
        <Route path="dashboard/more-treks" element={<MoreTreks />} />
        <Route path="additional" element={<Additionals />} />
        <Route path="dashboard/additional" element={<Additionals />} />

        {/* Settings */}
        <Route path="settings" element={<Profile />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router basename="/backend">
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

