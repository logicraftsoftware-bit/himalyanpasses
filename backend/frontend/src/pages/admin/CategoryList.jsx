import React, { useState, useEffect } from 'react';
import { apiGet, apiDelete } from '../../utils/api';
import { Edit2, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await apiGet('/api/categories');
      setCategories(data || []);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await apiDelete(`/api/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Categories (Treks / Tours / Expeditions)</h2>
        <button 
          onClick={() => navigate('/dashboard/categories/0?step=1')}
          className="bg-primary-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={18} /> Add
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b *:p-4 *:font-semibold *:text-gray-600">
              <th>Name</th>
              <th>Type</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-10 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat._id} className="border-b hover:bg-gray-50 *:p-4 *:text-sm">
                  <td className="font-medium text-gray-800">{cat.name}</td>
                  <td>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {cat.categoryType || 'Trek'}
                    </span>
                  </td>
                  <td className="text-gray-500">{cat.slug}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs ${cat.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {cat.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="flex gap-3">
                    <Link to={`/dashboard/categories/${cat._id}?step=1`} className="text-blue-600 hover:text-blue-800">
                      <Edit2 size={18} />
                    </Link>
                    <button onClick={() => deleteCategory(cat._id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

