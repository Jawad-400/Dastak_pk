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
import ProviderJobsFeed from './components/provider/ProviderJobsFeed';
import PlaceorderModal from './components/provider/PlaceorderModal';
import MyOrders from './components/provider/MyOrders';

// WebSocket Components
import FindJobs from './components/WebSocket/FindJobs';

import './styles.css';

// Home Page Component
function HomePage() {
  return (
    <>
      <Hero />
      <ServicesCategories />
      <HowItWorks />
      <div className="action-sections">
        <PostRequest />
      </div>
      <UserSignup />
      <Testimonials />
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
                     location.pathname.includes('/find-jobs');
  
  // Hide footer on provider pages
  const hideFooter = location.pathname.includes('/provider-dashboard') || 
                     location.pathname.includes('/my-orders') || 
                     location.pathname.includes('/find-jobs');

  return (
    <div className="App">
      {!hideHeader && <Header />}
      <Routes>
        {/* Home & Main Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicePage />} />
        <Route path="/post-request" element={<PostRequest />} />
        <Route path="/customer-login" element={<CustomerLoginPage />} />
        <Route path="/customer-portal" element={<CustomerOrderTracking />} />
        
        {/* Provider Routes */}
        <Route path="/provider-portal" element={<ProviderPortalPage />} />
        <Route path="/provider-dashboard" element={<ProviderDashboardPage />} />
        <Route path="/provider/jobs" element={<ProviderJobsFeed />} />
        <Route path="/provider/place-order" element={<PlaceorderModal />} />
        
        {/* Provider Routes */}
        <Route path="/my-orders" element={<MyOrders />} />
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