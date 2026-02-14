// data/serviceTypes.js
import { 
    FaWrench, FaBolt, FaSnowflake, FaHammer, FaPaintBrush, 
    FaBroom, FaTv, FaBug, FaTruck, FaSeedling, FaShieldAlt, 
    FaChalkboardTeacher, FaUtensils, FaCamera, FaGlassCheers, 
    FaCar, FaCut 
  } from 'react-icons/fa';
  
  export const SERVICE_TYPES = [
    {
      id: 1,
      name: 'Plumbing',
      value: 'plumbing',
      icon: FaWrench,
      color: '#3498db',
      description: 'Pipes, Taps, Toilets, Drainage',
      category: 'home_maintenance'
    },
    {
      id: 2,
      name: 'Electrical',
      value: 'electrical',
      icon: FaBolt,
      color: '#f39c12',
      description: 'Wiring, Switches, Fixtures, Lights',
      category: 'home_maintenance'
    },
    {
      id: 3,
      name: 'AC Repair',
      value: 'ac_repair',
      icon: FaSnowflake,
      color: '#00bcd4',
      description: 'AC Servicing, Gas Filling, Cooling Issues',
      category: 'appliance_repair'
    },
    {
      id: 4,
      name: 'Carpentry',
      value: 'carpentry',
      icon: FaHammer,
      color: '#9b59b6',
      description: 'Furniture, Doors, Cabinets, Repairing',
      category: 'home_maintenance'
    },
    {
      id: 5,
      name: 'Painting',
      value: 'painting',
      icon: FaPaintBrush,
      color: '#e74c3c',
      description: 'Home Painting, Wall Repair, Wall Paneling',
      category: 'home_renovation'
    },
    {
      id: 6,
      name: 'Cleaning',
      value: 'cleaning',
      icon: FaBroom,
      color: '#2ecc71',
      description: 'Home, Office, Deep Cleaning',
      category: 'cleaning'
    },
    {
      id: 7,
      name: 'Appliance Repair',
      value: 'appliance_repair',
      icon: FaTv,
      color: '#fd7e14',
      description: 'Washing Machine, Fridge, LCD, Oven',
      category: 'appliance_repair'
    },
    {
      id: 8,
      name: 'Pest Control',
      value: 'pest_control',
      icon: FaBug,
      color: '#dc3545',
      description: 'Termite, Cockroach, Mosquito, Fumigation',
      category: 'cleaning'
    },
    {
      id: 9,
      name: 'Movers',
      value: 'mover',
      icon: FaTruck,
      color: '#6c5ce7',
      description: 'Home/Office Shifting, Loading/Unloading',
      category: 'transport'
    },
    {
      id: 10,
      name: 'Gardener',
      value: 'gardener',
      icon: FaSeedling,
      color: '#00b894',
      description: 'Lawn Mowing, Plant Care, Landscaping',
      category: 'outdoor'
    },
    {
      id: 11,
      name: 'Security Guard',
      value: 'security',
      icon: FaShieldAlt,
      color: '#2d3436',
      description: 'Security Services, Guarding, Surveillance',
      category: 'security'
    },
    {
      id: 12,
      name: 'Home Tutor',
      value: 'teacher',
      icon: FaChalkboardTeacher,
      color: '#0984e3',
      description: 'Academic Tutoring, Test Preparation',
      category: 'education'
    },
    {
      id: 13,
      name: 'Chef/Cook',
      value: 'chef',
      icon: FaUtensils,
      color: '#e17055',
      description: 'Home Cooking, Event Catering, Meal Prep',
      category: 'personal_services'
    },
    {
      id: 14,
      name: 'Photographer',
      value: 'photographer',
      icon: FaCamera,
      color: '#d63031',
      description: 'Events, Portraits, Product Photography',
      category: 'events'
    },
    {
      id: 15,
      name: 'Event Planner',
      value: 'event_planner',
      icon: FaGlassCheers,
      color: '#e84342',
      description: 'Wedding Planning, Birthday Parties, Events',
      category: 'events'
    },
    {
      id: 16,
      name: 'Driver',
      value: 'driver',
      icon: FaCar,
      color: '#636e72',
      description: 'Personal Driver, Pick & Drop Services',
      category: 'transport'
    },
    {
      id: 17,
      name: 'Beautician',
      value: 'beautician',
      icon: FaCut,
      color: '#fd79a8',
      description: 'Makeup, Hair Styling, Beauty Services at Home',
      category: 'personal_services'
    }
  ];
  
  // Helper functions
  export const getServiceByValue = (value) => {
    return SERVICE_TYPES.find(service => service.value === value);
  };
  
  export const getServicesByCategory = (category) => {
    return SERVICE_TYPES.filter(service => service.category === category);
  };
  
  export const SERVICE_CATEGORIES = [
    { id: 'home_maintenance', name: 'Home Maintenance', icon: '🏠' },
    { id: 'home_renovation', name: 'Home Renovation', icon: '🔨' },
    { id: 'appliance_repair', name: 'Appliance Repair', icon: '🔧' },
    { id: 'cleaning', name: 'Cleaning & Pest Control', icon: '🧹' },
    { id: 'transport', name: 'Transport & Moving', icon: '🚚' },
    { id: 'outdoor', name: 'Outdoor Services', icon: '🌳' },
    { id: 'security', name: 'Security Services', icon: '🛡️' },
    { id: 'education', name: 'Education & Tutoring', icon: '📚' },
    { id: 'events', name: 'Events & Photography', icon: '📸' },
    { id: 'personal_services', name: 'Personal Services', icon: '💇' }
  ];
  
  // Simple array of values for dropdowns
  export const SERVICE_VALUES = SERVICE_TYPES.map(s => s.value);
  export const SERVICE_NAMES = SERVICE_TYPES.map(s => s.name);