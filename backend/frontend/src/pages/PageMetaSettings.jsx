import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Save, Plus, Settings as SettingsIcon, Trash2, Edit, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE, apiPost, apiDelete } from '../utils/api';

export default function PageMetaSettings() {
  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { user } = useAuth();
  
  const [form, setForm] = useState({
    _id: '',
    pageName: '',
    title: '',
    keyword: '',
    description: ''
  });

  useEffect(() => {
    fetchMetas();
  }, []);

  const fetchMetas = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/page-meta`);
      const data = await res.json();
      setMetas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load page meta');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditClick = (meta = null) => {
    if (meta) {
      setForm(meta);
    } else {
      setForm({ _id: '', pageName: '', title: '', keyword: '', description: '' });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.pageName) return toast.error('Page Name is required');
    
    setLoading(true);
    try {
      await apiPost('/api/page-meta', form);
      toast.success('Page Meta saved successfully!');
      setIsFormOpen(false);
      fetchMetas();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this page meta?')) return;
    setLoading(true);
    try {
      await apiDelete(`/api/page-meta/${id}`);
      toast.success('Deleted successfully');
      fetchMetas();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">SEO Page Meta Settings</h1>
        {!isFormOpen && (
          <button 
            onClick={() => handleEditClick(null)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            <Plus size={18} /> Add Page Meta
          </button>
        )}
      </div>
      
      {isFormOpen && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b">
            <h2 className="text-lg font-semibold text-gray-800">{form._id ? 'Edit' : 'Add'} Page Meta</h2>
            <button onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Page Name / Route <span className="text-red-500">*</span></label>
                <input
                  name="pageName"
                  placeholder="e.g., Home, About Us, Cars, /contact"
                  value={form.pageName}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                  required
                  disabled={!!form._id} // Prevent changing page name if editing an existing entry, relying on POST to update
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Meta Title</label>
                <input
                  name="title"
                  placeholder="Title for SEO"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Meta Keywords</label>
                <input
                  name="keyword"
                  placeholder="comma separated keywords"
                  value={form.keyword}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Meta Description</label>
                <textarea
                  name="description"
                  placeholder="Description for SEO..."
                  value={form.description}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 h-24"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-6 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-primary-600 text-white px-8 py-2 rounded-lg hover:bg-primary-700 font-medium disabled:opacity-70"
              >
                <Save size={18} />
                {loading ? 'Saving...' : 'Save Meta Data'}
              </button>
            </div>
          </form>
        </div>
      )}

      {!isFormOpen && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : metas.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <SettingsIcon size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No page meta data found.</p>
              <p className="text-gray-400 text-sm mt-1 mb-6">Click the Add button to set up SEO metadata for pages.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left">
                <thead className="bg-gray-50 border-b text-sm text-gray-600 font-medium">
                  <tr>
                    <th className="px-6 py-4">Page Name</th>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Keywords</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-center w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 align-top">
                  {metas.map((meta) => (
                    <tr key={meta._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{meta.pageName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{meta.title || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{meta.keyword || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={meta.description}>{meta.description || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={() => handleEditClick(meta)}
                            className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded border border-blue-100 hover:bg-blue-100 transition"
                          >
                            <Edit size={14} /> Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(meta._id)}
                            className="flex items-center justify-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded border border-red-100 hover:bg-red-100 transition"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

