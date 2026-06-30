import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, Image as ImageIcon, Edit } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../components/ui/Table";
import { apiPost, apiPut, apiDelete, API_BASE } from '../utils/api';

export default function CustomerStories() {
  const [customerStories, setCustomerStories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    youtubeLink: '',
    isActive: true,
  });

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const { user } = useAuth();

  /* ================= FETCH ================= */
  const fetchCustomerStories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/customer-stories`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setCustomerStories(data);
      } else {
        setCustomerStories([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerStories();
  }, []);

  /* ================= FORM HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  /* ================= ADD / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form };

    try {
      if (editingId) {
        await apiPut(`/api/customer-stories/${editingId}`, payload);
      } else {
        await apiPost('/api/customer-stories', payload);
      }
      setForm({ title: '', description: '', youtubeLink: '', isActive: true });
      setEditingId(null);
      toast.success(editingId ? 'Story updated successfully' : 'Story added successfully');
      fetchCustomerStories();
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* ================= DELETE ================= */
  const deleteCustomerStory = async (id) => {
    if (!window.confirm('Delete this customer story?')) return;
    try {
      await apiDelete(`/api/customer-stories/${id}`);
      toast.success('Story deleted successfully');
      fetchCustomerStories();
    } catch {
      toast.error('Failed to delete customer story');
    }
  };



  /* ================= EDIT ================= */
  const startEdit = (t) => {
    setEditingId(t._id);
    setForm({
      title: t.title,
      description: t.description,
      youtubeLink: t.youtubeLink || '',
      isActive: t.isActive,
    });
  };

  /* ================= CANCEL EDIT ================= */
  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      title: '',
      description: '',
      youtubeLink: '',
      isActive: true
    });
  };

  return (
    <div className="p-6 space-y-8">
      {/* ================= ADD / EDIT FORM ================= */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          {editingId ? <Edit size={18} /> : <Plus size={18} />} {editingId ? 'Edit' : 'Add'} Customer Story
        </h2>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">

          <input
            name="title"
            required
            placeholder="Title (e.g., Trek Experience Story)"
            value={form.title}
            onChange={handleChange}
            className="input md:col-span-2"
          />

          <textarea
            name="description"
            required
            placeholder="Customer story description..."
            value={form.description}
            onChange={handleChange}
            className="input md:col-span-2 h-24"
          />

          <input
            name="youtubeLink"
            required
            placeholder="YouTube Link (e.g., https://youtube.com/watch?...)"
            value={form.youtubeLink}
            onChange={handleChange}
            className="input md:col-span-2"
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
            />
            Active
          </label>

          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700"
            >
              {editingId ? 'Update' : 'Save'} Customer Story
            </button>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-300 text-black p-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ================= LIST ================= */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Customer Stories</h2>

        {loading ? (
          <p>Loading...</p>
        ) : customerStories.length === 0 ? (
          <p className="text-gray-500">No customer stories found</p>
        ) : (
          <Table className="border">
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>YouTube Link</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {customerStories.map((t) => (
                <TableRow key={t._id}>
                  <TableCell>
                    <p className="font-medium">{t.title}</p>
                  </TableCell>

                  <TableCell>{t.description}</TableCell>

                  <TableCell>
                    {t.youtubeLink ? (
                      <a
                        href={t.youtubeLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {t.youtubeLink}
                      </a>
                    ) : (
                      '-'
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => startEdit(t)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => deleteCustomerStory(t._id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded"
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
        )}
      </div>
    </div>
  );
}

