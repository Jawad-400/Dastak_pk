import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import ServicesCategories from './components/ServicesCategories';
import ServicePage from './components/ServicePage';
import HowItWorks from './components/HowItWorks';
import PostRequest from './components/PostRequest';
import UserSignup from './components/UserSignup';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import ProviderPortal from './components/ProviderPortal';
import ProviderDashboard from './components/ProviderDashboard';
import CustomerAuth from './components/CustomerAuth';
import CustomerLogin from './components/CustomerLogin';
import ProviderJobsFeed from './components/provider/ProviderJobsFeed';
import PlaceorderModal from './components/provider/PlaceorderModal';
import MyOrders from './components/provider/MyOrders';
import FindJobs from './components/provider/FindJob';
import CustomerOrderTracking from './components/CustomerOrderTracking';

import './styles.css';

const CustomerPortalMap = lazy(() => import('./pages/CustomerPortalMap'));

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

// Customer Auth Page
function CustomerAuthPage() {
  return <CustomerAuth />;
}

// Customer Login Page
function CustomerLoginPage() {
  return <CustomerLogin />;
}

// Main App Component with conditional header
function AppContent() {
  const location = useLocation();
  
  // Hide header on provider pages
  const hideHeader = location.pathname.includes('/provider-dashboard') || 
                     location.pathname.includes('/my-Orders') || 
                     location.pathname.includes('/find-jobs');
  
  // Hide footer on provider pages
  const hideFooter = location.pathname.includes('/provider-dashboard') || 
                     location.pathname.includes('/my-Orders') || 
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
        <Route path="/customer-portal" element={<CustomerAuthPage />} />
        <Route path="/customer-orders" element={<CustomerOrderTracking />} />
        {/* Provider Routes */}
        <Route path="/provider-portal" element={<ProviderPortalPage />} />
        <Route path="/provider-dashboard" element={<ProviderDashboardPage />} />
        <Route path="/provider/jobs" element={<ProviderJobsFeed />} />
        <Route path="/provider/place-order" element={<PlaceorderModal />} />
 
<Route path="/post-request" element={<PostRequest />} />
        
        {/* New Provider Routes */}
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/find-jobs" element={<FindJobs />} />
        
        {/* Customer Portal Map */}
        <Route 
          path="/customer-portal-map" 
          element={
            <Suspense fallback={<div className="panel">Loading map...</div>}>
              <CustomerPortalMap />
            </Suspense>
          } 
        />
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