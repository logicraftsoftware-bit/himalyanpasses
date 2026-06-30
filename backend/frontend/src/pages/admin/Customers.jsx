import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2, Edit2, X, Upload, Search } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/Table";

const API_BASE = import.meta.env.VITE_API_BASE || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:4000' : '');

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editData, setEditData] = useState({
    id: '',
    fullName: '',
    mobile: '',
    email: '',
    location: '',
    photo: '',
    photoPreview: '',
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users?page=${page}&search=${search}&limit=10`);
      const responseData = await res.json();
      if (responseData.success && Array.isArray(responseData.data)) {
        setCustomers(responseData.data);
        setTotalPages(responseData.totalPages || 1);
        setTotalRecords(responseData.totalRecords || 0);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  const deleteCustomer = async (id) => {
    if (!window.confirm('Delete this customer account permanently?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to delete customer');

      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openEditModal = (customer) => {
    setEditData({
      id: customer._id,
      fullName: customer.fullName || '',
      mobile: customer.mobile || '',
      email: customer.email || '',
      location: customer.location || '',
      photo: '',
      photoPreview: customer.photo || '',
    });
    setIsEditModalOpen(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setEditData((prev) => ({
        ...prev,
        photoPreview: event.target.result,
        photo: event.target.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      const payload = {
        fullName: editData.fullName,
        mobile: editData.mobile,
        email: editData.email,
        location: editData.location,
        ...(editData.photo && { photo: editData.photo }),
      };

      const res = await fetch(`${API_BASE}/api/users/${editData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to update customer');

      toast.success('Customer updated successfully');
      setIsEditModalOpen(false);
      fetchCustomers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Customers Administration</h1>
        
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email, phone, location..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Customers List</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : customers.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No customers found matching your search.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="border">
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Mobile Number</TableHead>
                   <TableHead>Email Address</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Joined At</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {customers.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      {item.photo ? (
                        <img
                          src={item.photo}
                          alt={item.fullName}
                          className="h-10 w-10 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold border">
                          {item.fullName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <p className="font-semibold text-gray-900">{item.fullName}</p>
                    </TableCell>

                    <TableCell>
                      <p className="text-gray-700">{item.mobile || '-'}</p>
                    </TableCell>

                     <TableCell>
                      <p className="text-gray-700">{item.email}</p>
                    </TableCell>

                    <TableCell>
                      <p className="text-gray-700">{item.location || '-'}</p>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()} at{" "}
                        {new Date(item.createdAt).toLocaleTimeString()}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="rounded p-1 text-blue-600 hover:text-blue-800"
                          title="Edit Customer"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteCustomer(item._id)}
                          className="rounded p-1 text-red-600 hover:text-red-800"
                          title="Delete Customer"
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
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Edit Customer</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="flex flex-col items-center justify-center gap-4 py-4">
                <div className="relative h-24 w-24 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {editData.photoPreview ? (
                    <img
                      src={editData.photoPreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Upload className="text-gray-400" size={24} />
                  )}
                </div>
                <label className="cursor-pointer rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition">
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={editData.fullName}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mobile Number</label>
                <input
                  type="text"
                  required
                  value={editData.mobile}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, mobile: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

               <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={editData.email}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  value={editData.location}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, location: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-75 transition"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
