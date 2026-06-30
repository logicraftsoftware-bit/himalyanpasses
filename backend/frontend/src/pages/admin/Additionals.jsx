import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2, Edit, X, Loader2 } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/Table";

const API_BASE = import.meta.env.VITE_API_BASE || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:4000' : '');

const getToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem('glacier_user') || '{}');
    return user?.token || '';
  } catch {
    return '';
  }
};

export default function Additionals() {
  const [additionals, setAdditionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', priceINR: '', priceUSD: '' });
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [existingPublicIds, setExistingPublicIds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchAdditionals = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/additionals`, {
        
      });
      if (!res.ok) throw new Error('Failed to fetch additionals');
      const data = await res.json();
      setAdditionals(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch additionals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdditionals();
  }, []);

  const openModal = (additional = null) => {
    if (additional) {
      setEditingId(additional._id);
      setFormData({
        name: additional.name,
        priceINR: additional.priceINR,
        priceUSD: additional.priceUSD
      });
      setExistingImages(additional.imageUrls || []);
      setExistingPublicIds(additional.publicIds || []);
    } else {
      setEditingId(null);
      setFormData({ name: '', priceINR: '', priceUSD: '' });
      setExistingImages([]);
      setExistingPublicIds([]);
    }
    setFiles([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', priceINR: '', priceUSD: '' });
    setFiles([]);
    setExistingImages([]);
    setExistingPublicIds([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
    setExistingPublicIds(existingPublicIds.filter((_, i) => i !== index));
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId 
        ? `${API_BASE}/api/additionals/${editingId}` 
        : `${API_BASE}/api/additionals`;
      const method = editingId ? 'PUT' : 'POST';
      
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('priceINR', Number(formData.priceINR) || 0);
      submitData.append('priceUSD', Number(formData.priceUSD) || 0);

      files.forEach(file => {
          submitData.append('images', file);
      });

      if (editingId) {
          submitData.append('existingImages', JSON.stringify(existingImages));
          submitData.append('existingPublicIds', JSON.stringify(existingPublicIds));
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: submitData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || 'Failed to save additional');
      }

      toast.success(`Additional ${editingId ? 'updated' : 'added'} successfully`);
      closeModal();
      fetchAdditionals();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this additional?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/additionals/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || 'Failed to delete');
      }
      
      toast.success('Additional deleted successfully');
      fetchAdditionals();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f3f4f6] p-6 text-gray-800">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Package Additionals</h1>
        <button
          onClick={() => openModal()}
          className="rounded bg-primary-600 px-4 py-2 font-medium text-white transition"
        >
          + Add New Additional
        </button>
      </div>

      <div className="rounded-xl bg-gray-50 p-6 shadow-sm">
        {loading ? (
          <p>Loading...</p>
        ) : additionals.length === 0 ? (
          <p className="text-gray-500">No additionals found</p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full text-left">
              <TableHeader>
                <TableRow className="border-b border-gray-300">
                  <TableHead className="font-semibold text-gray-600 uppercase py-3">Images</TableHead>
                  <TableHead className="font-semibold text-gray-600 uppercase py-3">Name</TableHead>
                  <TableHead className="font-semibold text-gray-600 uppercase py-3">Price INR</TableHead>
                  <TableHead className="font-semibold text-gray-600 uppercase py-3">Price USD</TableHead>
                  <TableHead className="text-center font-semibold text-gray-600 uppercase py-3">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {additionals.map((item) => (
                  <TableRow key={item._id} className="border-b border-gray-200 hover:bg-gray-100">
                    <TableCell className="py-4">
                      {item.imageUrls && item.imageUrls.length > 0 ? (
                        <div className="flex gap-2">
                           <img src={item.imageUrls[0]} alt="thumbnail" className="w-12 h-12 object-cover rounded shadow-sm" />
                           {item.imageUrls.length > 1 && (
                             <span className="text-xs text-gray-500 self-center">+{item.imageUrls.length - 1} more</span>
                           )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-sm">No images</span>
                      )}
                    </TableCell>

                    <TableCell className="py-4">
                      <p className="text-gray-900 font-medium">{item.name}</p>
                    </TableCell>

                    <TableCell className="py-4">
                       <p className="text-gray-700">â‚¹{parseFloat(item.priceINR).toFixed(2)}</p>
                    </TableCell>

                    <TableCell className="py-4">
                       <p className="text-gray-700">${parseFloat(item.priceUSD).toFixed(2)}</p>
                    </TableCell>

                    <TableCell className="py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => openModal(item)}
                          className="rounded bg-primary-600 p-2 text-white hover:opacity-80 transition"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="rounded bg-[#D32F2F] p-2 text-white hover:opacity-80 transition"
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
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto pt-10 pb-10">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl relative my-auto">
             <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            <h2 className="mb-6 text-xl font-bold text-gray-800">Additional Thing Info</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Additional Thing Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Additional Thing Name"
                  className="w-full rounded-md border border-green-400 p-2 outline-none focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Images
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full rounded-md border border-gray-300 p-2 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                />
                
                {(existingImages.length > 0 || files.length > 0) && (
                  <div className="mt-4 grid grid-cols-4 gap-3">
                    {existingImages.map((img, idx) => (
                      <div key={`existing-${idx}`} className="relative group">
                        <img src={img} alt="existing" className="h-20 w-full object-cover rounded-md border border-gray-200" />
                        <button type="button" onClick={() => removeExistingImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                      </div>
                    ))}
                    {files.map((f, idx) => (
                       <div key={`new-${idx}`} className="relative group">
                        <img src={URL.createObjectURL(f)} alt="new" className="h-20 w-full object-cover rounded-md border border-green-300" />
                        <button type="button" onClick={() => removeFile(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Price INR
                  </label>
                  <input
                    type="number"
                    name="priceINR"
                    value={formData.priceINR}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 p-2 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Price USD
                  </label>
                  <input
                    type="number"
                    name="priceUSD"
                    value={formData.priceUSD}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 p-2 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                  />
                </div>
              </div>

              <div className="mt-6 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded flex items-center justify-center bg-primary-600 px-6 py-2 font-medium text-white hover:bg-green-600 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

