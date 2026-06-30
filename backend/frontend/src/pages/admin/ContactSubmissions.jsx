import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2, Mail, Phone, Calendar, MessageSquare, CheckCircle, Clock, Search } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/Table";

const API_BASE = import.meta.env.VITE_API_BASE || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:4000' : '');

export default function ContactSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/contacts?page=${page}&search=${search}&limit=10`);
      const responseData = await res.json();
      if (responseData.success) {
        setSubmissions(responseData.data);
        setTotalPages(responseData.totalPages || 1);
        setTotalRecords(responseData.totalRecords || 0);
      }
    } catch (err) {
      toast.error("Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [page, search]);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Status updated to ${status}`);
        fetchSubmissions();
      }
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const deleteSubmission = async (id) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/contacts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Deleted successfully');
        // If it was the last item on the page, go back a page
        if (submissions.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          fetchSubmissions();
        }
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-700';
      case 'Read': return 'bg-yellow-100 text-yellow-700';
      case 'Replied': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Mail className="text-teal-600" />
          Contact Us Submissions
        </h1>
        
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email, phone, message..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-teal-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">Submissions List</h2>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No submissions found matching your search.</div>
        ) : (
          <>
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Info</TableHead>
                  <TableHead className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Message</TableHead>
                  <TableHead className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</TableHead>
                  <TableHead className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</TableHead>
                  <TableHead className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100">
                {submissions.map((sub) => (
                  <TableRow key={sub._id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{sub.name}</span>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                          <Mail size={12} className="text-teal-500" />
                          {sub.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                          <Phone size={12} className="text-teal-500" />
                          {sub.phoneNumber}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 max-w-xs">
                      <div className="flex gap-2">
                        <MessageSquare size={14} className="text-gray-400 shrink-0 mt-1" />
                        <p className="text-sm text-gray-600 line-clamp-2" title={sub.message}>{sub.message}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar size={12} />
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5 ml-4">
                        <Clock size={10} />
                        {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <select 
                        value={sub.status || 'New'} 
                        onChange={(e) => updateStatus(sub._id, e.target.value)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-full border-none outline-none cursor-pointer ${getStatusColor(sub.status)}`}
                      >
                        <option value="New">NEW</option>
                        <option value="Read">READ</option>
                        <option value="Replied">REPLIED</option>
                      </select>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <button 
                        onClick={() => deleteSubmission(sub._id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">Total: {totalRecords} | Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                    <button 
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 transition shadow-sm text-sm font-medium"
                    >Previous</button>
                    <button 
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 transition shadow-sm text-sm font-medium"
                    >Next</button>
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

