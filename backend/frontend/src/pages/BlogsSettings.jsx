import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Search } from 'lucide-react';
import { API_BASE, apiPostForm, apiPutForm, apiDelete, authMultipartHeaders, getToken } from '../utils/api';

export default function BlogsSettings() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [globalTags, setGlobalTags] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editingGlobalTag, setEditingGlobalTag] = useState(null);
  const [tagFormData, setTagFormData] = useState({ name: '' });
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    tag: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 12
  });
  
  const [formData, setFormData] = useState({
    heading: '',
    category: [],
    content: '',
    metaTitle: '',
    metaKeywords: '',
    metaDescription: '',
    tags: [],
    slug: '',
    publishDate: new Date().toISOString().split('T')[0]
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: ''
  });
  
  const [images, setImages] = useState({
    thumbnail: null,
    image1: null,
    image2: null,
    image3: null
  });

  const [imagePreviews, setImagePreviews] = useState({
    thumbnail: null,
    image1: null,
    image2: null,
    image3: null
  });

  const [submitting, setSubmitting] = useState(false);

  const editorRef = useRef(null);

  useEffect(() => {
    fetchBlogs(1); // Reset to page 1 when filters change
  }, [filters]);

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  useEffect(() => {
    let editorInstance = null;
    if (isModalOpen) {
      const script = document.createElement('script');
      script.src = "https://cdn.ckeditor.com/4.22.1/full/ckeditor.js";
      script.async = true;
      script.onload = () => {
        if (window.CKEDITOR) {
          if (window.CKEDITOR.instances.blogContent) {
            window.CKEDITOR.instances.blogContent.destroy(true);
          }
          editorInstance = window.CKEDITOR.replace('blogContent', {
            height: 400,
            versionCheck: false,
            removeButtons: '', // Keep all buttons
          });
          editorInstance.on('instanceReady', () => {
            editorInstance.setData(formData.content);
          });
          editorInstance.on('change', () => {
            setFormData(prev => ({ ...prev, content: editorInstance.getData() }));
          });
        }
      };
      document.body.appendChild(script);
    }
    return () => {
      if (window.CKEDITOR && window.CKEDITOR.instances.blogContent) {
        window.CKEDITOR.instances.blogContent.destroy(true);
      }
    };
  }, [isModalOpen]);

  const fetchBlogs = async (page = pagination.page) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        search: filters.search,
        category: filters.category,
        tag: filters.tag
      });
      const response = await fetch(`${API_BASE}/api/blogs?${params}`);
      const data = await response.json();
      setBlogs(data.blogs || []);
      setPagination({
        page: data.page,
        pages: data.pages,
        total: data.total,
        limit: 12
      });
    } catch (error) {
      toast.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/blog-categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/blog-tags`);
      const data = await response.json();
      setGlobalTags(data);
      setAllTags(data.map(t => t.name));
    } catch (error) {
      console.error('Failed to fetch tags', error);
    }
  };

  const resetForm = () => {
    setFormData({ heading: '', category: [], content: '', slug: '', metaTitle: '', metaKeywords: '', metaDescription: '', tags: [], publishDate: new Date().toISOString().split('T')[0] });
    setImages({ thumbnail: null, image1: null, image2: null, image3: null });
    setImagePreviews({ thumbnail: null, image1: null, image2: null, image3: null });
    setEditingBlog(null);
  };

  const handleOpenModal = (blog = null) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        heading: blog.heading,
        category: blog.category?.map(c => c._id) || [],
        content: blog.content,
        metaTitle: blog.metaTitle || '',
        metaKeywords: blog.metaKeywords || '',
        metaDescription: blog.metaDescription || '',
        tags: blog.tags || [],
        slug: blog.slug || '',
        publishDate: blog.publishDate ? new Date(blog.publishDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
      setImagePreviews({
        thumbnail: blog.thumbnail?.url || null,
        image1: blog.image1?.url || null,
        image2: blog.image2?.url || null,
        image3: blog.image3?.url || null
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const slugify = (text) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  };

  const handleHeadingChange = (e) => {
    const newHeading = e.target.value;
    setFormData(prev => {
      const shouldUpdateSlug = !prev.slug || prev.slug === slugify(prev.heading);
      return {
        ...prev,
        heading: newHeading,
        slug: shouldUpdateSlug ? slugify(newHeading) : prev.slug
      };
    });
  };

  const handleImageChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setImages(prev => ({ ...prev, [field]: file }));
      setImagePreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.heading || !formData.content) {
      toast.error('Heading and content are required');
      return;
    }

    setSubmitting(true);
    const data = new FormData();
    data.append('heading', formData.heading);
    formData.category.forEach(catId => data.append('category', catId));
    data.append('content', formData.content);
    data.append('metaTitle', formData.metaTitle);
    data.append('metaKeywords', formData.metaKeywords);
    data.append('metaDescription', formData.metaDescription);
    formData.tags.forEach(tag => data.append('tags', tag));
    data.append('publishDate', formData.publishDate);
    data.append('slug', formData.slug);
    
    if (images.thumbnail) data.append('thumbnail', images.thumbnail);
    if (images.image1) data.append('image1', images.image1);
    if (images.image2) data.append('image2', images.image2);
    if (images.image3) data.append('image3', images.image3);

    try {
      if (editingBlog) {
        await apiPutForm(`/api/blogs/${editingBlog._id}`, data);
        toast.success('Blog updated successfully');
      } else {
        await apiPostForm('/api/blogs', data);
        toast.success('Blog created successfully');
      }
      fetchBlogs();
      handleCloseModal();
    } catch (error) {
      toast.error(error.message || 'Failed to save blog');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await apiDelete(`/api/blogs/${id}`);
        toast.success('Blog deleted successfully');
        fetchBlogs();
      } catch (error) {
        toast.error('Failed to delete blog');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const data = new FormData();
      data.append('active', newStatus);
      await apiPutForm(`/api/blogs/${id}`, data);
      toast.success('Status updated successfully');
      setBlogs(blogs.map(b => b._id === id ? { ...b, active: newStatus } : b));
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryFormData.name) {
      toast.error('Category name is required');
      return;
    }

    try {
      if (editingCategory) {
        await fetch(`${API_BASE}/api/blog-categories/${editingCategory._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify(categoryFormData)
        });
        toast.success('Category updated successfully');
      } else {
        await fetch(`${API_BASE}/api/blog-categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify(categoryFormData)
        });
        toast.success('Category created successfully');
      }
      fetchCategories();
      setCategoryFormData({ name: '' });
      setEditingCategory(null);
    } catch (error) {
      toast.error('Failed to save category');
    }
  };

  const handleCategoryDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await fetch(`${API_BASE}/api/blog-categories/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  const handleTagSubmit = async (e) => {
    e.preventDefault();
    if (!tagFormData.name) {
      toast.error('Tag name is required');
      return;
    }

    try {
      if (editingGlobalTag) {
        const response = await fetch(`${API_BASE}/api/blog-tags/${editingGlobalTag._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify(tagFormData)
        });
        if (!response.ok) throw new Error();
        toast.success('Tag updated successfully');
      } else {
        const response = await fetch(`${API_BASE}/api/blog-tags`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify(tagFormData)
        });
        if (!response.ok) throw new Error();
        toast.success('Tag created successfully');
      }
      fetchTags();
      setTagFormData({ name: '' });
      setEditingGlobalTag(null);
    } catch (error) {
      toast.error('Failed to save tag, maybe it already exists?');
    }
  };

  const handleTagDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      try {
        await fetch(`${API_BASE}/api/blog-tags/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        toast.success('Tag deleted successfully');
        fetchTags();
      } catch (error) {
        toast.error('Failed to delete tag');
      }
    }
  };

  const modules = {
    toolbar: [
      ['undo', 'redo'],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }],
      ['link', 'image', 'video', 'table'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video', 'table',
    'color', 'background', 'align', 'script', 'code-block', 'direction'
  ];

  const filteredBlogs = blogs; // Now filtered on server

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blogs</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your website's blog posts.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsTagModalOpen(true)}
            className="flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tags
          </button>
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
          >
            <Plus className="w-5 h-5 mr-2" />
            Blog Categories
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Blog
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by heading..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        
        <div>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filters.tag}
            onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blog Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publish Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBlogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900">{blog.heading}</div>
                        {blog.category && Array.isArray(blog.category) && blog.category.map(cat => (
                          <span key={cat._id} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-semibold rounded-full uppercase">
                            {cat.name}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Thumbnail */}
                        <div className="h-12 w-16 flex-shrink-0">
                          {blog.thumbnail?.url ? (
                            <img className="h-12 w-16 rounded-md object-cover border border-gray-200" src={blog.thumbnail.url} alt="Thumbnail" />
                          ) : (
                            <div className="h-12 w-16 rounded-md bg-gray-50 border border-gray-200 flex flex-col items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-gray-300" />
                              <span className="text-[10px] text-gray-400 mt-1">Thumb</span>
                            </div>
                          )}
                        </div>
                        {/* Image 1 */}
                        <div className="h-12 w-16 flex-shrink-0">
                          {blog.image1?.url ? (
                            <img className="h-12 w-16 rounded-md object-cover border border-gray-200" src={blog.image1.url} alt="Image 1" />
                          ) : (
                            <div className="h-12 w-16 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-gray-300" />
                            </div>
                          )}
                        </div>
                        {/* Image 2 */}
                        <div className="h-12 w-16 flex-shrink-0">
                          {blog.image2?.url ? (
                            <img className="h-12 w-16 rounded-md object-cover border border-gray-200" src={blog.image2.url} alt="Image 2" />
                          ) : (
                            <div className="h-12 w-16 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-gray-300" />
                            </div>
                          )}
                        </div>
                        {/* Image 3 */}
                        <div className="h-12 w-16 flex-shrink-0">
                          {blog.image3?.url ? (
                            <img className="h-12 w-16 rounded-md object-cover border border-gray-200" src={blog.image3.url} alt="Image 3" />
                          ) : (
                            <div className="h-12 w-16 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-gray-300" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={blog.active}
                      onChange={(e) => handleStatusChange(blog._id, e.target.value === 'true')}
                      className={`text-sm rounded-full px-8 py-1 font-semibold cursor-pointer border-none focus:ring-0 ${
                        blog.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <option value={true} className="bg-white text-gray-900">Active</option>
                      <option value={false} className="bg-white text-gray-900">Inactive</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {blog.publishDate ? new Date(blog.publishDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(blog)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredBlogs.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    No blogs found. Create your first one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchBlogs(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
              >
                Previous
              </button>
              <div className="flex items-center px-4 text-sm font-medium text-gray-700">
                Page {pagination.page} of {pagination.pages}
              </div>
              <button
                onClick={() => fetchBlogs(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleCloseModal}></div>

            <div className="relative inline-block w-full max-w-4xl p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl sm:my-8 bg-white">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {editingBlog ? 'Edit Blog' : 'Add New Blog'}
                </h3>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Heading</label>
                    <input
                      type="text"
                      value={formData.heading}
                      onChange={handleHeadingChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Slug (URL Name)</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                      
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                    <div className="mt-1 block w-full rounded-md border border-gray-300 p-2 max-h-32 overflow-y-auto space-y-2 bg-white">
                      {categories.map(cat => (
                        <label key={cat._id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={formData.category.includes(cat._id)}
                            onChange={(e) => {
                              const newCategories = e.target.checked
                                ? [...formData.category, cat._id]
                                : formData.category.filter(id => id !== cat._id);
                              setFormData({ ...formData, category: newCategories });
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <div className="mt-1 block w-full rounded-md border border-gray-300 p-2 max-h-32 overflow-y-auto space-y-2 bg-white">
                      {globalTags.map(tag => (
                        <label key={tag._id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={formData.tags.includes(tag.name)}
                            onChange={(e) => {
                              const newTags = e.target.checked
                                ? [...formData.tags, tag.name]
                                : formData.tags.filter(name => name !== tag.name);
                              setFormData({ ...formData, tags: newTags });
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{tag.name}</span>
                        </label>
                      ))}
                      {globalTags.length === 0 && (
                        <span className="text-sm text-gray-500 p-1 block">No tags available. Create tags first.</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Meta Title</label>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Meta Keywords</label>
                    <input
                      type="text"
                      value={formData.metaKeywords}
                      onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Publish Date</label>
                    <input
                      type="date"
                      value={formData.publishDate}
                      onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                  <textarea
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <div className="bg-white border rounded-md overflow-hidden">
                    <textarea 
                      id="blogContent" 
                      name="blogContent" 
                      defaultValue={formData.content}
                    ></textarea>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
                  {['thumbnail', 'image1', 'image2', 'image3'].map((field, idx) => (
                    <div key={field} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 capitalize">
                        {field === 'thumbnail' ? 'Thumbnail' : `Image ${idx}`}
                      </label>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          {imagePreviews[field] ? (
                            <img src={imagePreviews[field]} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                              <p className="text-xs text-gray-500">Click to upload image</p>
                            </div>
                          )}
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, field)}
                          />
                        </label>
                      </div>
                      {imagePreviews[field] && (
                        <button
                          type="button"
                          onClick={() => {
                            setImages(prev => ({ ...prev, [field]: null }));
                            setImagePreviews(prev => ({ ...prev, [field]: null }));
                          }}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>
                  ))}
                </div>



                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Blog'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setIsCategoryModalOpen(false)}></div>

            <div className="relative inline-block w-full max-w-2xl p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl sm:my-8 bg-white">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Manage Blog Categories
                </h3>
                <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCategorySubmit} className="space-y-4 mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category Name</label>
                    <input
                      type="text"
                      value={categoryFormData.name}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end items-center">
                  <div className="flex gap-2">
                    {editingCategory && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(null);
                          setCategoryFormData({ name: '' });
                        }}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      {editingCategory ? 'Update' : 'Add'} Category
                    </button>
                  </div>
                </div>
              </form>

              <div className="overflow-hidden border border-gray-200 rounded-lg max-h-[400px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  
                  <tbody className="bg-white divide-y divide-gray-200 max-h-400px overflow-y-auto">
                    {categories.map((cat) => (
                      <tr key={cat._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900 font-medium">{cat.name}</td>
                        <td className="px-4 py-2 text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setCategoryFormData({ name: cat.name });
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCategoryDelete(cat._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {isTagModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setIsTagModalOpen(false)}></div>

            <div className="relative inline-block w-full max-w-2xl p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl sm:my-8 bg-white">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Manage Tags
                </h3>
                <button onClick={() => setIsTagModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleTagSubmit} className="space-y-4 mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tag Name</label>
                    <input
                      type="text"
                      value={tagFormData.name}
                      onChange={(e) => setTagFormData({ ...tagFormData, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end items-center">
                  <div className="flex gap-2">
                    {editingGlobalTag && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingGlobalTag(null);
                          setTagFormData({ name: '' });
                        }}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      {editingGlobalTag ? 'Update' : 'Add'} Tag
                    </button>
                  </div>
                </div>
              </form>

              <div className="overflow-hidden border border-gray-200 rounded-lg max-h-[400px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  
                  <tbody className="bg-white divide-y divide-gray-200 max-h-400px overflow-y-auto">
                    {globalTags.map((tag) => (
                      <tr key={tag._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900 font-medium">{tag.name}</td>
                        <td className="px-4 py-2 text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setEditingGlobalTag(tag);
                              setTagFormData({ name: tag.name });
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleTagDelete(tag._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

