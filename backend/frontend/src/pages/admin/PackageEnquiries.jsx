import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2, Edit, X, Search, Filter } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/Table";

const API_BASE = import.meta.env.VITE_API_BASE || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:4000' : '');

export default function PackageEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [form, setForm] = useState({
    status: 'Pending',
  });

  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/package-enquiries?page=${page}&search=${search}&limit=10`);
      const responseData = await res.json();

      if (responseData.success) {
        setEnquiries(responseData.data);
        setTotalPages(responseData.totalPages || 1);
      } else {
        setEnquiries([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [page, search]);

  const closeModal = () => {
    setModalOpen(false);
    setSelectedEnquiry(null);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedEnquiry) return;

    try {
      const res = await fetch(`${API_BASE}/api/package-enquiries/${selectedEnquiry._id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: form.status }),
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update status');
      }

      toast.success('Status updated successfully');
      fetchEnquiries();
      closeModal();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteEnquiry = async (id) => {
    if (!window.confirm('Delete this enquiry?')) return;

    try {
      const res = await fetch(`${API_BASE}/api/package-enquiries/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!res.ok) throw new Error('Failed to delete enquiry');

      toast.success('Enquiry deleted successfully');
      fetchEnquiries();
    } catch {
      toast.error('Failed to delete enquiry');
    }
  };

  const openEditModal = (item) => {
    setSelectedEnquiry(item);
    setForm({
      status: item.status || 'Pending',
    });
    setModalOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Package Enquiry Management</h1>
        
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email, or phone..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl bg-white p-6 shadow">
        <div className="mb-4">
            <h2 className="text-xl font-semibold">Package Enquiries List</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : enquiries.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No enquiries found</p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="border">
              <TableHeader>
                <TableRow>
                  <TableHead>Package</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Requested Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {enquiries.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <p className="font-medium text-blue-600">{item.package?.packageName || 'Deleted Package'}</p>
                   
                    </TableCell>

                    <TableCell>
                      <p className="font-medium">{item.fullName}</p>
                      <p className="text-xs text-gray-500">Submitted: {new Date(item.createdAt).toLocaleDateString()}</p>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        <p>{item.email}</p>
                        <p className="text-gray-500">{item.contactNumber}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        <p><span className="font-medium">From:</span> {new Date(item.fromDate).toLocaleDateString()}</p>
                        <p><span className="font-medium">To:</span> {new Date(item.toDate).toLocaleDateString()}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        item.status === 'Contacted' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.status}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="rounded p-1 text-blue-600 hover:text-blue-800"
                          title="Update Status"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          onClick={() => deleteEnquiry(item._id)}
                          className="rounded p-1 text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="mt-6 flex items-center justify-between border-t pt-4">
                <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
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
          </div>
        )}
      </div>

      {/* Status Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Update Enquiry Status
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleStatusUpdate}>
              <div className="px-6 py-6 space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                    <p><span className="font-bold">Customer:</span> {selectedEnquiry?.fullName}</p>
                    <p><span className="font-bold">Package:</span> {selectedEnquiry?.package?.packageName}</p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                  <select 
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 rounded-b-xl bg-gray-50 px-6 py-4 border-t border-gray-100">
                <button type="button" onClick={closeModal} className="text-sm font-medium text-gray-700 hover:bg-gray-200 px-4 py-2 rounded">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 shadow-sm">
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

