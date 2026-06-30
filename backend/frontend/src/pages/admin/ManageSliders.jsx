import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Upload, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE, apiPostForm, apiPutForm, apiPatch, apiDelete } from '../../utils/api';

export default function Sliders() {
  const { token, hasPermission } = useAuth();
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null); // single image
  const [videoFile, setVideoFile] = useState(null);
  const [heading, setHeading] = useState('');
  const [subType, setSubType] = useState('');
  const [link, setLink] = useState('');
  const [preview, setPreview] = useState(''); // single preview
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/sliders`);
      if (!res.ok) throw new Error('Failed to load sliders');
      const data = await res.json();
      setSliders(data);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch sliders');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    e.target.value = null;
  };

  const handleRemoveFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview('');
  };

  const handleVideoChange = (e) => setVideoFile(e.target.files[0]);

  // ---------------- CLOUDINARY UPLOAD ----------------
  const uploadToBackend = async (file, heading, subType, link, isEditingId = null) => {
    const formData = new FormData();

    if (file) {
      formData.append('files', file);
      formData.append('isVideo', file.type.startsWith('video/'));
    } else if (!isEditingId) {
      throw new Error('No file provided');
    }

    if (heading !== undefined) formData.append('heading', heading);
    if (subType !== undefined) formData.append('subType', subType);
    if (link !== undefined) formData.append('link', link);

    if (isEditingId) {
      return await apiPutForm(`/api/sliders/${isEditingId}`, formData);
    } else {
      return await apiPostForm('/api/sliders/upload', formData);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!editingId && !file) {
      return toast.error('Select image to upload');
    }

    try {
      setLoading(true);
      const uploadedSlider = await uploadToBackend(file, heading, subType, link, editingId);

      if (editingId) {
        setSliders((prev) => prev.map((s) => (s._id === editingId ? uploadedSlider : s)));
        toast.success('Slider updated successfully');
      } else {
        setSliders((prev) => [uploadedSlider, ...prev]);
        toast.success('Image uploaded successfully!');
      }

      if (preview) {
        URL.revokeObjectURL(preview);
      }

      setFile(null);
      setPreview('');
      setHeading('');
      setSubType('');
      setLink('');
      setEditingId(null);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (s) => {
    setEditingId(s._id);
    setHeading(s.heading || '');
    setSubType(s.subType || '');
    setLink(s.link || '');
    setFile(null);

    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview('');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slider?')) return;
    try {
      setLoading(true);
      await apiDelete(`/api/sliders/${id}`);
      setSliders((prev) => prev.filter((s) => s._id.toString() !== id.toString()));
      toast.success('Deleted');
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- TOGGLE ACTIVE ----------------
  const handleToggleActive = async (s) => {
    try {
      const updated = await apiPatch(`/api/sliders/${s._id}`, { active: !s.active });
      setSliders((prev) => prev.map((sl) => (sl._id === updated._id ? updated : sl)));
      toast.success('Updated');
    } catch (err) {
      toast.error(err.message || 'Update failed');
    }
  };

  const videoSliders = sliders.filter((s) => s.isVideo);
  const imageSliders = sliders.filter((s) => !s.isVideo);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Manage Sliders</h1>

      {/* IMAGE UPLOAD */}
      <div className="card space-y-4">
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="border p-2 rounded w-full"
              />
              {editingId && (
                <span className="text-xs text-gray-500 mt-1 block">
                  Optional: Select new image to replace old one.
                </span>
              )}
            </div>

            <input
              type="text"
              placeholder="Heading (Optional)"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="border p-2 rounded w-full"
            />

            <input
              type="text"
              placeholder="Sub-type / Sub-heading"
              value={subType}
              onChange={(e) => setSubType(e.target.value)}
              className="border p-2 rounded w-full"
            />

            <input
              type="text"
              placeholder="Link (e.g. /packages/trek-name)"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          {preview && (
            <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 shadow-inner">
              <div className="relative h-24 w-24 ring-1 ring-gray-200 rounded-lg group shadow-sm">
                <img src={preview} className="h-full w-full object-cover rounded-lg" alt="prev" />
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  title="Remove"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-[10px] text-white p-1 text-center truncate">
                  {file?.name}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              className={`btn btn-primary w-full md:w-auto flex items-center justify-center ${
                editingId ? 'bg-green-600 hover:bg-green-700 text-white p-2 rounded font-medium' : ''
              }`}
              disabled={loading}
            >
              {editingId ? (
                <>Update Text & Image</>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" /> Upload & Add Image
                </>
              )}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setHeading('');
                  setSubType('');
                  setLink('');
                  setFile(null);
                  if (preview) {
                    URL.revokeObjectURL(preview);
                  }
                  setPreview('');
                }}
                className="btn bg-gray-300 text-black px-4 rounded md:w-auto w-full font-medium"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className="p-2">Preview</th>
              <th className="p-2">Heading</th>
              <th className="p-2">Sub-type</th>
              <th className="p-2">Link</th>
              <th className="p-2">Created</th>
              <th className="p-2">Active</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {imageSliders.map((i) => (
              <tr key={i._id} className="border-t">
                <td className="p-2">
                  <img
                    src={i.imageUrl || (i.imageUrls && i.imageUrls[0]) || ''}
                    className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                    alt="slider"
                  />
                </td>
                <td className="p-2">{i.heading || '-'}</td>
                <td className="p-2">{i.subType || '-'}</td>
                <td className="p-2">{i.link || '-'}</td>
                <td className="p-2">{new Date(i.createdAt).toLocaleString()}</td>
                <td className="p-2">
                  <button
                    onClick={() => handleToggleActive(i)}
                    className={`px-3 py-1 rounded ${
                      i.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {i.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(i)}
                      className="bg-blue-100 text-blue-800 p-2 rounded hover:bg-blue-200"
                      title="Edit Details"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(i._id)}
                      className="bg-red-100 text-red-800 p-2 rounded hover:bg-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

