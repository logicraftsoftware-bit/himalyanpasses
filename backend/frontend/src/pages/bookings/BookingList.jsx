import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Edit, Trash2, X, Eye, Search } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/Table";

const API_BASE = import.meta.env.VITE_API_BASE || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:4000' : '');

export default function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [form, setForm] = useState({
    bookingStatus: 'pending',
    paymentStatus: 'pending',
  });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/bookings?page=${page}&search=${search}&limit=10`);
      const responseData = await res.json();
      if (responseData.success && Array.isArray(responseData.data)) {
        setBookings(responseData.data);
        setTotalPages(responseData.totalPages || 1);
        setTotalRecords(responseData.totalRecords || 0);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, search]);

  const openViewModal = (booking) => {
    setSelectedBooking(booking);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedBooking(null);
  };

  const openEditModal = (booking) => {
    setSelectedBooking(booking);
    setForm({
      bookingStatus: booking.bookingStatus || 'pending',
      paymentStatus: booking.paymentStatus || 'pending',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedBooking(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${selectedBooking._id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update booking');

      toast.success('Booking status updated successfully');
      fetchBookings();
      closeModal();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm('Delete this booking?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete booking');
      toast.success('Booking deleted successfully');
      fetchBookings();
    } catch (err) {
      toast.error('Failed to delete booking');
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Booking Management</h1>
        
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by customer, package, email..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl bg-white p-6 shadow">
        <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Bookings List</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : bookings.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No bookings found matching your search.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="border">
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {bookings.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <p className="font-medium">{item.fullName}</p>
                      <span className="text-xs text-gray-500">{item.email}</span>
                    </TableCell>

                    <TableCell>{item.contactNumber}</TableCell>

                    <TableCell>
                      <p className="font-medium text-sm">{item.packageName}</p>
                      <p className="text-xs text-gray-500">{item.groupType} ({item.numberOfPeople} px)</p>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        {new Date(item.fromDate).toLocaleDateString()} - <br/>
                        {new Date(item.toDate).toLocaleDateString()}
                      </div>
                    </TableCell>

                    <TableCell>
                      <p className="font-semibold text-green-600">â‚¹{item.totalAmount}</p>
                    </TableCell>

                    <TableCell>
                      <span className={`inline-block px-2 text-xs font-semibold rounded-full pb-0.5 mb-1 ${item.bookingStatus === 'confirmed' ? 'bg-green-100 text-green-800' : item.bookingStatus === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {item.bookingStatus.toUpperCase()}
                      </span>
                      <br/>
                      <span className={`inline-block px-2 text-xs font-semibold rounded-full pb-0.5 ${item.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : item.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                        Payment: {item.paymentStatus.toUpperCase()}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openViewModal(item)}
                          className="rounded p-1 text-teal-600 hover:text-teal-800"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => openEditModal(item)}
                          className="rounded p-1 text-blue-600 hover:text-blue-800"
                          title="Edit Status"
                        >
                          <Edit size={16} />
                        </button>

                        {/* <button
                          onClick={() => deleteBooking(item._id)}
                          className="rounded p-1 text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button> */}
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

      {/* Edit Status Modal */}
      {modalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6">
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-800 transition"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Update Booking Status</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Booking Status</label>
                <select
                  name="bookingStatus"
                  value={form.bookingStatus}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Payment Status</label>
                <select
                  name="paymentStatus"
                  value={form.paymentStatus}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3 p-1">
                 <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
                 >
                   Cancel
                 </button>
                 <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                 >
                   Save
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl p-6">
            <button
              onClick={closeViewModal}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-800 transition"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">Booking Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Customer Info</p>
                <p className="font-medium text-lg">{selectedBooking.fullName}</p>
                <p>{selectedBooking.email}</p>
                <p>{selectedBooking.contactNumber}</p>
                <p className="text-sm mt-1">{selectedBooking.address}</p>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Package Info</p>
                <p className="font-medium text-lg text-blue-700">{selectedBooking.packageName}</p>
                <p>Group: {selectedBooking.groupType}</p>
                <p>People: {selectedBooking.numberOfPeople}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Financials</p>
                <p>Per Person: â‚¹{selectedBooking.pricePerPerson}</p>
                <p>Subtotal: â‚¹{selectedBooking.subtotal}</p>
                <p className="text-sm text-gray-500">+ GST ({selectedBooking.gstPercent}%): â‚¹{selectedBooking.gstAmount}</p>
                <p className="font-bold text-green-700 mt-1">Total: â‚¹{selectedBooking.totalAmount}</p>
              </div>

              {selectedBooking.additionals && selectedBooking.additionals.length > 0 && (
                <div className="md:col-span-2 border-t pt-4 mt-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Selected Additionals</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedBooking.additionals.map((add, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-blue-50 p-2 rounded border border-blue-100 text-sm">
                        <span className="font-medium text-blue-800">{add.name}</span>
                        <span className="text-blue-600 font-semibold">â‚¹{add.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 border-t pt-4">
              <p className="text-sm font-bold uppercase tracking-wide mb-3">Participants</p>
              <div className="space-y-3">
                {selectedBooking.participants?.map((p, i) => (
                  <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                     <div className="w-full font-semibold">{i+1}. {p.fullName}</div>
                     {p.phone && <div>ðŸ“ž {p.phone}</div>}
                     {p.email && <div>âœ‰ï¸ {p.email}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

