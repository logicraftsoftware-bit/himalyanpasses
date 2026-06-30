import { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, Eye, X, Users, Phone, Mail, MessageSquare } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:4000' : '');

export default function Enquiry() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selected, setSelected] = useState(null);
  const limit = 10;

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit, search });
      const res = await fetch(`${API_BASE}/api/enquiries?${params}`);
      const data = await res.json();
      if (data.success) {
        setEnquiries(data.data);
        setTotalPages(data.totalPages);
        setTotalRecords(data.totalRecords);
      }
    } catch (err) {
      console.error('Failed to fetch enquiries:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchEnquiries(); }, [fetchEnquiries]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this enquiry?')) return;
    try {
      await fetch(`${API_BASE}/api/enquiries/${id}`, { method: 'DELETE' });
      fetchEnquiries();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">General Enquiries</h1>
        <p className="text-gray-500 text-sm mt-1">{totalRecords} total enquiries</p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">Loading...</div>
        ) : enquiries.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-400">No enquiries found</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Contact</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Persons</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Message</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {enquiries.map((e, i) => (
                <tr key={e._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400">{(page - 1) * limit + i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{e.fullName}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1 text-gray-600"><Phone className="h-3 w-3" />{e.contactNumber}</span>
                      {e.email && <span className="flex items-center gap-1 text-gray-400"><Mail className="h-3 w-3" />{e.email}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                      <Users className="h-3 w-3" />{e.numberOfPerson}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{e.message || 'â€”'}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(e.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelected(e)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(e._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
              Previous
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Enquiry Details</h2>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                <p className="font-medium text-gray-800">{selected.fullName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                  <p className="font-medium text-gray-800">{selected.contactNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Persons</p>
                  <p className="font-medium text-gray-800">{selected.numberOfPerson}</p>
                </div>
              </div>
              {selected.email && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Email</p>
                  <p className="font-medium text-gray-800">{selected.email}</p>
                </div>
              )}
              {selected.message && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Message</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{selected.message}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Submitted</p>
                <p className="text-gray-600 text-sm">{formatDate(selected.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

