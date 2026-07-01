import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Info,
  Settings,
  Mail,
  FileText,
  PlusCircle,
  Target,
  Images,
  BookOpen,
  FileBadge,
  House,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Users,
  Package,
  Map,
  BookMarked,
} from 'lucide-react';
import { cn } from '../../utils';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Home Page',
    icon: House,
    children: [
      { name: 'Manage Sliders', href: '/sliders', icon: Images },
      { name: 'Manage Announcement', href: '/announcement', icon: Images },
      { name: 'Customer Stories', href: '/customer-stories', icon: BookOpen },
      { name: 'Certificates', href: '/certificates', icon: FileBadge },
      { name: 'FAQs', href: '/faqs', icon: MessageSquare },
    ],
  },
  { name: 'Site Settings', href: '/site-settings', icon: Settings },
  { name: 'SEO Settings', href: '/seo-settings', icon: Target },
  {
    name: 'About Us',
    icon: Info,
    children: [
      { name: 'Main Settings', href: '/about-us', icon: Settings },
      { name: 'Manage Sections', href: '/about-us-sections', icon: PlusCircle },
    ],
  },
  { name: 'Policies', href: '/policies', icon: FileText },
  {
    name: 'Enquiries',
    icon: Mail,
    children: [
      { name: 'General Enquiries', href: '/enquiry', icon: MessageSquare },
      { name: 'Package Enquiries', href: '/package-enquiries', icon: Package },
    ],
  },
  { name: 'Contact Us', href: '/contacts', icon: Mail },
  { name: 'Bookings', href: '/bookings', icon: BookMarked },
  {
    name: 'Package Management',
    icon: Package,
    children: [
      { name: 'Packages', href: '/packages', icon: FileText },
      { name: 'More Treks', href: '/more-treks', icon: Map },
      { name: 'Additionals', href: '/additional', icon: PlusCircle },
      { name: 'Categories', href: '/categories', icon: FileText },
    ],
  },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Blogs', href: '/blogs-settings', icon: BookOpen },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState(new Set());

  const toggleExpanded = (itemName) => {
    const next = new Set(expandedItems);
    if (next.has(itemName)) next.delete(itemName);
    else next.add(itemName);
    setExpandedItems(next);
  };

  const isActive = (href) =>
    location.pathname === href || location.pathname.startsWith(href + '/');

  const hasAnyChildActive = (children) =>
    children?.some((child) => child.href && isActive(child.href));

  return (
    <div className={cn(
      'bg-white border-r border-gray-200 flex flex-col transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200">
        {collapsed ? (
          <div className="w-9 h-9 rounded-lg overflow-hidden">
            <img src="/backend/logo.jpeg" alt="logo" className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-14 h-14 rounded-lg overflow-hidden mr-2">
              <img src="/backend/logo.jpeg" alt="logo" className="w-full h-full object-contain" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navigation.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.has(item.name);
          const hasActiveChild = hasAnyChildActive(item.children);

          return (
            <div key={item.name}>
              {hasChildren ? (
                <>
                  <button
                    onClick={() => !collapsed && toggleExpanded(item.name)}
                    className={cn(
                      'sidebar-link w-full justify-between',
                      (hasActiveChild || isExpanded) && 'active'
                    )}
                    title={collapsed ? item.name : ''}
                  >
                    <div className="flex items-center">
                      <item.icon className="h-5 w-5 mr-3" />
                      {!collapsed && <span>{item.name}</span>}
                    </div>
                    {!collapsed && (
                      <div className="ml-auto">
                        {isExpanded
                          ? <ChevronDown className="h-4 w-4" />
                          : <ChevronRight className="h-4 w-4" />}
                      </div>
                    )}
                  </button>

                  {!collapsed && isExpanded && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.href}
                          to={child.href}
                          className={({ isActive }) => cn(
                            'block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md',
                            isActive && 'text-primary-700 bg-primary-50'
                          )}
                        >
                          {child.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.href}
                  className={({ isActive }) => cn('sidebar-link', isActive && 'active')}
                  title={collapsed ? item.name : ''}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {!collapsed && <span>{item.name}</span>}
                </NavLink>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-700">
                {user?.fullName?.charAt(0) || user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.fullName || user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

