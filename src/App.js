import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { LocationProvider } from './context/LocationContext';

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

//==============================footer pages =============================//

import About from './components/About';
import Careers from './components/Careers';
import Blog from './components/Blog';
import Press from './components/Press';
import HelpCenter from './components/HelpCenter';
import SafetyCenter from './components/SafetyCenter';
import FAQs from './components/FAQs';
import Terms from './components/Terms';
import Privacy from './components/Privacy';
import Cookies from './components/Cookies';
import Disclaimer from './components/Disclaimer';
import Sitemap from './components/Sitemap';
import Contact from './components/Contact';


import './styles.css';

// Home Page Component
function HomePage() {
  return (
    <>
      <Hero />
      <ServicesCategories />
      <div className="action-sections">
        <PostRequest />
      </div>
      <UserSignup />
      <Testimonials />
    </>
  );
}

// How It Works Page
function HowItWorksPage() {
  return <HowItWorks />;
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

// Main App Component
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
        <Route path="/services" element={<Allservices />} />
        <Route path="/post-request" element={<PostRequest />} />
        <Route path="/customer-login" element={<CustomerLoginPage />} />
        <Route path="/customer-portal" element={<CustomerOrderTracking />} />
        <Route path="/customer-orders" element={<CustomerOrderTracking />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        
        {/* Provider Routes */}
        <Route path="/provider-portal" element={<ProviderPortalPage />} />
        <Route path="/provider-dashboard" element={<ProviderDashboardPage />} />
        <Route path="/provider/jobs" element={<Allservices />} />
        <Route path="/provider/place-order" element={<PlaceorderModal />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/find-jobs" element={<Allservices />} />

        {/*footer pages routes*/}
        <Route path="/about" element={<About />} />
<Route path="/careers" element={<Careers />} />
<Route path="/blog" element={<Blog />} />
<Route path="/press" element={<Press />} />
<Route path="/help" element={<HelpCenter />} />
<Route path="/safety" element={<SafetyCenter />} />
<Route path="/faqs" element={<FAQs />} />
<Route path="/terms" element={<Terms />} />
<Route path="/privacy" element={<Privacy />} />
<Route path="/cookies" element={<Cookies />} />
<Route path="/disclaimer" element={<Disclaimer />} />
<Route path="/sitemap" element={<Sitemap />} />
<Route path="/contact" element={<Contact />} />

      </Routes>
      {!hideFooter && <Footer />}
    </div>
  );
}

// Main App Component
function App() {
  return (
    <Router>
      <LocationProvider>
        <AppContent />
      </LocationProvider>
    </Router>
  );
}

export default App;
