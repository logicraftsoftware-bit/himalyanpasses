import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE, apiPost, apiPut, apiPatch, apiDelete } from '../../utils/api';

export default function ManageAnnouncements() {
  const { token } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    let editorInstance = null;
    const script = document.createElement('script');
    script.src = "https://cdn.ckeditor.com/4.22.1/full/ckeditor.js";
    script.async = true;
    script.onload = () => {
      if (window.CKEDITOR) {
        if (window.CKEDITOR.instances.announcementDesc) {
          window.CKEDITOR.instances.announcementDesc.destroy(true);
        }
        editorInstance = window.CKEDITOR.replace('announcementDesc', {
          height: 200,
          versionCheck: false,
        });
        editorInstance.on('instanceReady', () => {
          editorInstance.setData(description);
        });
        editorInstance.on('change', () => {
          setDescription(editorInstance.getData());
        });
      }
    };
    if (window.CKEDITOR) {
      if (window.CKEDITOR.instances.announcementDesc) {
        window.CKEDITOR.instances.announcementDesc.destroy(true);
      }
      editorInstance = window.CKEDITOR.replace('announcementDesc', {
        height: 200,
        versionCheck: false,
      });
      editorInstance.on('instanceReady', () => {
        editorInstance.setData(description);
      });
      editorInstance.on('change', () => {
        setDescription(editorInstance.getData());
      });
    } else {
      document.body.appendChild(script);
    }

    return () => {
      if (window.CKEDITOR && window.CKEDITOR.instances.announcementDesc) {
        window.CKEDITOR.instances.announcementDesc.destroy(true);
      }
    };
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/announcements`);
      if (!res.ok) throw new Error('Failed to load announcements');
      const data = await res.json();
      setAnnouncements(data);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const descData = window.CKEDITOR && window.CKEDITOR.instances.announcementDesc
      ? window.CKEDITOR.instances.announcementDesc.getData()
      : description;

    if (!heading || !descData) {
      return toast.error('Heading and description are required');
    }

    try {
      setLoading(true);
      const payload = { heading, description: descData };
      let updatedAnnouncement;

      if (editingId) {
        updatedAnnouncement = await apiPut(`/api/announcements/${editingId}`, payload);
        setAnnouncements((prev) => prev.map((a) => (a._id === editingId ? updatedAnnouncement : a)));
        toast.success('Announcement updated successfully');
      } else {
        updatedAnnouncement = await apiPost('/api/announcements', payload);
        setAnnouncements((prev) => [updatedAnnouncement, ...prev]);
        toast.success('Announcement added successfully!');
      }

      setHeading('');
      setDescription('');
      setEditingId(null);
      if (window.CKEDITOR && window.CKEDITOR.instances.announcementDesc) {
        window.CKEDITOR.instances.announcementDesc.setData('');
      }
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (a) => {
    setEditingId(a._id);
    setHeading(a.heading || '');
    setDescription(a.description || '');
    if (window.CKEDITOR && window.CKEDITOR.instances.announcementDesc) {
      window.CKEDITOR.instances.announcementDesc.setData(a.description || '');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      setLoading(true);
      await apiDelete(`/api/announcements/${id}`);
      setAnnouncements((prev) => prev.filter((a) => a._id.toString() !== id.toString()));
      toast.success('Deleted');
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (a) => {
    try {
      const updated = await apiPatch(`/api/announcements/${a._id}`, { active: !a.active });
      setAnnouncements((prev) => prev.map((ann) => (ann._id === updated._id ? updated : ann)));
      toast.success('Updated');
    } catch (err) {
      toast.error(err.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Manage Announcements</h1>

      <div className="card space-y-4 bg-white p-6 rounded-lg shadow-sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
            <input
              type="text"
              placeholder="Announcement Heading"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <div className="bg-white border rounded-lg overflow-hidden">
              <textarea id="announcementDesc" name="announcementDesc" defaultValue={description}></textarea>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className={`btn btn-primary w-full md:w-auto flex items-center justify-center ${
                editingId ? 'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium' : 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium'
              }`}
              disabled={loading}
            >
              {editingId ? 'Update Announcement' : 'Add Announcement'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setHeading('');
                  setDescription('');
                  if (window.CKEDITOR && window.CKEDITOR.instances.announcementDesc) {
                    window.CKEDITOR.instances.announcementDesc.setData('');
                  }
                }}
                className="btn bg-gray-300 text-black px-4 rounded md:w-auto w-full font-medium"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className="overflow-x-auto mt-6">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2 pb-3">Heading</th>
                <th className="p-2 pb-3">Created</th>
                <th className="p-2 pb-3">Active</th>
                <th className="p-2 pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((a) => (
                <tr key={a._id} className="border-b">
                  <td className="p-2 py-3 font-medium">{a.heading}</td>
                  <td className="p-2 py-3">{new Date(a.createdAt).toLocaleString()}</td>
                  <td className="p-2 py-3">
                    <button
                      onClick={() => handleToggleActive(a)}
                      className={`px-3 py-1 rounded text-sm ${
                        a.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {a.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-2 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditClick(a)}
                        className="bg-blue-100 text-blue-800 p-2 rounded hover:bg-blue-200"
                        title="Edit Details"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(a._id)}
                        className="bg-red-100 text-red-800 p-2 rounded hover:bg-red-200"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {announcements.length === 0 && !loading && (
                <tr>
                  <td colSpan="4" className="text-center p-8 text-gray-500">
                    No announcements found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

