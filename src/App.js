import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';

// Home Page Components
import Hero from './components/Hero';
import ServicesCategories from './components/ServicesCategories';
import HowItWorks from './components/HowItWorks';
import UserSignup from './components/UserSignup';
import Testimonials from './components/Testimonials';

// Service Components
import ServicePage from './components/ServicePage';
import PostRequest from './components/PostRequest';

// Customer Components
import CustomerOrderTracking from './components/CustomerOrderTracking';
import CustomerLogin from './components/auth/CustomerLogin';

// Provider Components
import ProviderPortal from './components/ProviderPortal';
import ProviderDashboard from './components/ProviderDashboard';
import Allservices from './components/provider/Allservices';
import PlaceorderModal from './components/PostRequest';
import MyOrders from './components/provider/MyOrders';

// WebSocket Components
import FindJobs from './components/provider/Allservices';

import './styles.css';

// Home Page Component - WITHOUT HowItWorks (since it has its own route now)
function HomePage() {
  return (
    <>
      <Hero />
      <ServicesCategories />
      {/* REMOVED HowItWorks from here - it now has its own page */}
      <div className="action-sections">
        <PostRequest />
      </div>
      <UserSignup />
      <Testimonials />
    </>
  );
}

// How It Works Page - Full page version
function HowItWorksPage() {
  return (
    <>
      <HowItWorks />
    </>
  );
}

// Provider Portal Page
function ProviderPortalPage() {
  return <ProviderPortal />;
}

// Provider Dashboard Page
function ProviderDashboardPage() {
  return <ProviderDashboard />;
}

// Customer Login Page
function CustomerLoginPage() {
  return <CustomerLogin />;
}

// Main App Component with conditional header/footer
function AppContent() {
  const location = useLocation();
  
  // Hide header on provider pages
  const hideHeader = location.pathname.includes('/provider-dashboard') || 
                     location.pathname.includes('/my-orders') || 
                     location.pathname.includes('/find-jobs') 
  
  // Hide footer on provider pages
  const hideFooter = location.pathname.includes('/provider-dashboard') || 
                     location.pathname.includes('/my-orders') || 
                     location.pathname.includes('/find-jobs') 

  return (
    <div className="App">
      {!hideHeader && <Header />}
      <Routes>
        {/* Home & Main Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<FindJobs />} />
        <Route path="/post-request" element={<PostRequest />} />
        <Route path="/customer-login" element={<CustomerLoginPage />} />
        <Route path="/customer-portal" element={<CustomerOrderTracking />} />
        <Route path="/customer-orders" element={<CustomerOrderTracking />} />
        
        {/* ✅ FIXED: How It Works Route - Now works correctly */}
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        
        {/* Provider Routes */}
        <Route path="/provider-portal" element={<ProviderPortalPage />} />
        <Route path="/provider-dashboard" element={<ProviderDashboardPage />} />
        <Route path="/provider/jobs" element={<Allservices />} />
        <Route path="/provider/place-order" element={<PlaceorderModal />} />
        
        {/* Provider Routes */}
        <Route path="/my-orders" element={<ProviderDashboard />} />
        <Route path="/find-jobs" element={<FindJobs />} />
      </Routes>
      {!hideFooter && <Footer />}
    </div>
  );
}

// Main App Component
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;