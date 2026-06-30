import { useEffect, useState } from 'react';
import { Package, BookOpen, Users, MessageSquare, TrendingUp, Star, PhoneCall } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:4000' : '');

async function fetchCount(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.totalRecords ?? data.total ?? data.count ?? (Array.isArray(data.data) ? data.data.length : 0);
  } catch {
    return 0;
  }
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    packages: 0,
    bookings: 0,
    enquiries: 0,
    packageEnquiries: 0,
    customers: 0,
    contacts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [packages, bookings, enquiries, packageEnquiries, customers, contacts] = await Promise.all([
        fetchCount(`${API_BASE}/api/packages?limit=1`),
        fetchCount(`${API_BASE}/api/bookings?limit=1`),
        fetchCount(`${API_BASE}/api/enquiries?limit=1`),
        fetchCount(`${API_BASE}/api/package-enquiries?limit=1`),
        fetchCount(`${API_BASE}/api/users?limit=1`),
        fetchCount(`${API_BASE}/api/contacts?limit=1`),
      ]);
      setStats({ packages, bookings, enquiries, packageEnquiries, customers, contacts });
      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    { label: 'Total Packages', value: stats.packages, icon: Package, color: 'bg-blue-50 text-blue-600', href: '/packages' },
    { label: 'Total Bookings', value: stats.bookings, icon: BookOpen, color: 'bg-green-50 text-green-600', href: '/bookings' },
    { label: 'General Enquiries', value: stats.enquiries, icon: MessageSquare, color: 'bg-purple-50 text-purple-600', href: '/enquiry' },
    { label: 'Package Enquiries', value: stats.packageEnquiries, icon: PhoneCall, color: 'bg-orange-50 text-orange-600', href: '/package-enquiries' },
    { label: 'Customers', value: stats.customers, icon: Users, color: 'bg-teal-50 text-teal-600', href: '/customers' },
    { label: 'Contact Messages', value: stats.contacts, icon: TrendingUp, color: 'bg-pink-50 text-pink-600', href: '/contacts' },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome to Glacier Treks & Adventures admin panel</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card) => (
          <a key={card.label} href={card.href}
            className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
              <card.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {loading ? <span className="inline-block w-8 h-6 bg-gray-100 rounded animate-pulse" /> : card.value}
              </p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

