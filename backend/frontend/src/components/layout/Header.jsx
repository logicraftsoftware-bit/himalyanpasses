import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  LogOut,
  User,
} from 'lucide-react';

export default function Header({ onToggleSidebar, sidebarCollapsed }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/sliders')) return 'Manage Sliders';
    if (path.startsWith('/customer-stories')) return 'Customer Stories';
    if (path.startsWith('/certificates')) return 'Certificates';
    if (path.startsWith('/faqs')) return 'FAQs';
    if (path.startsWith('/site-settings')) return 'Site Settings';
    if (path.startsWith('/seo-settings')) return 'SEO Settings';
    if (path.startsWith('/about-us')) return 'About Us';
    if (path.startsWith('/policies')) return 'Policies';
    if (path.startsWith('/enquiry')) return 'General Enquiries';
    if (path.startsWith('/package-enquiries')) return 'Package Enquiries';
    if (path.startsWith('/contacts')) return 'Contact Submissions';
    if (path.startsWith('/bookings')) return 'Bookings';
    if (path.startsWith('/packages')) return 'Packages';
    if (path.startsWith('/more-treks')) return 'More Treks';
    if (path.startsWith('/additional')) return 'Additional Services';
    if (path.startsWith('/categories')) return 'Categories';
    if (path.startsWith('/customers')) return 'Customers';
    if (path.startsWith('/blogs-settings')) return 'Blogs';
    if (path.startsWith('/settings')) return null;
    return 'Glacier Treks & Adventure Admin';
  };

  const pageTitle = getPageTitle();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="ml-4 lg:ml-0">
            {pageTitle && (
              <h1 className="text-2xl font-semibold text-gray-900">{pageTitle}</h1>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/settings');
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profile
                  </button>
                  <hr className="my-1" />
                  <button 
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

