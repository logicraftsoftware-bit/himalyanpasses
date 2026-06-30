import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { API_BASE, apiPostForm, apiPutForm, apiDelete } from '../utils/api';

export default function AboutUsSections() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    heading: '',
    pageName: '',
    content: '',
    slug: '',
    metaTitle: '',
    metaKeywords: '',
    metaDescription: ''
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    let editorInstance = null;
    if (isModalOpen) {
      const script = document.createElement('script');
      script.src = "https://cdn.ckeditor.com/4.22.1/full/ckeditor.js";
      script.async = true;
      script.onload = () => {
        if (window.CKEDITOR) {
          if (window.CKEDITOR.instances.sectionContent) {
            window.CKEDITOR.instances.sectionContent.destroy(true);
          }
          editorInstance = window.CKEDITOR.replace('sectionContent', {
            height: 300,
            versionCheck: false,
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
      if (window.CKEDITOR && window.CKEDITOR.instances.sectionContent) {
        window.CKEDITOR.instances.sectionContent.destroy(true);
      }
    };
  }, [isModalOpen]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/about-us-sections`);
      const data = await response.json();
      setSections(data || []);
    } catch (error) {
      toast.error('Failed to fetch sections');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      heading: '',
      pageName: '',
      content: '',
      slug: '',
      metaTitle: '',
      metaKeywords: '',
      metaDescription: ''
    });
    setImage(null);
    setImagePreview(null);
    setEditingSection(null);
  };

  const handleOpenModal = (section = null) => {
    if (section) {
      setEditingSection(section);
      setFormData({
        heading: section.heading,
        pageName: section.pageName || '',
        content: section.content,
        slug: section.slug,
        metaTitle: section.metaTitle || '',
        metaKeywords: section.metaKeywords || '',
        metaDescription: section.metaDescription || ''
      });
      setImagePreview(section.image?.url || null);
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
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.heading || !formData.content || !formData.slug) {
      toast.error('Heading, content, and slug are required');
      return;
    }

    setSubmitting(true);
    const data = new FormData();
    data.append('heading', formData.heading);
    data.append('pageName', formData.pageName);
    data.append('content', formData.content);
    data.append('slug', formData.slug);
    data.append('metaTitle', formData.metaTitle);
    data.append('metaKeywords', formData.metaKeywords);
    data.append('metaDescription', formData.metaDescription);
    if (image) data.append('image', image);

    try {
      if (editingSection) {
        await apiPutForm(`/api/about-us-sections/${editingSection._id}`, data);
        toast.success('Section updated successfully');
      } else {
        await apiPostForm('/api/about-us-sections', data);
        toast.success('Section created successfully');
      }
      fetchSections();
      handleCloseModal();
    } catch (error) {
      toast.error(error.message || 'Failed to save section');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await apiDelete(`/api/about-us-sections/${id}`);
        toast.success('Section deleted successfully');
        fetchSections();
      } catch (error) {
        toast.error('Failed to delete section');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">About Us Sections</h1>
          <p className="text-sm text-gray-500 mt-1">Manage sub-pages or sections for About Us.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Section
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page Name / Heading</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sections.map((section) => (
                <tr key={section._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {section.image?.url ? (
                      <img className="h-12 w-20 rounded-md object-cover border border-gray-200" src={section.image.url} alt={section.heading} />
                    ) : (
                      <div className="h-12 w-20 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{section.pageName || 'No Page Name'}</div>
                    <div className="text-xs text-gray-500">{section.heading}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{section.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(section)}
                      className="text-blue-600 hover:text-blue-900 mr-4 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(section._id)}
                      className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {sections.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    No sections found. Add your first one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-black/60 backdrop-blur-sm" onClick={handleCloseModal}></div>

            <div className="relative inline-block w-full max-w-4xl p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl sm:my-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingSection ? 'Edit Section' : 'Add New Section'}
                </h3>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Page Name</label>
                    <input
                      type="text"
                      value={formData.pageName}
                      onChange={(e) => setFormData({ ...formData, pageName: e.target.value })}
                      className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500 p-2.5 border"
                      placeholder="e.g. Our History"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
                    <input
                      type="text"
                      value={formData.heading}
                      onChange={handleHeadingChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500 p-2.5 border"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL Name)</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                      className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500 p-2.5 border"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500 p-2.5 border"
                      placeholder="SEO Title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
                    <input
                      type="text"
                      value={formData.metaKeywords}
                      onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                      className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500 p-2.5 border"
                      placeholder="keyword1, keyword2..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500 p-2.5 border h-[42px]"
                      rows="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <div className="bg-white border rounded-lg overflow-hidden">
                    <textarea 
                      id="sectionContent" 
                      name="sectionContent" 
                      defaultValue={formData.content}
                    ></textarea>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Image</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      {imagePreview ? (
                        <div className="relative w-full h-full">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                            <p className="text-white font-medium bg-black/40 px-4 py-2 rounded-lg">Change Image</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
                          <p className="text-sm text-gray-500 font-medium">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG or WEBP (MAX. 5MB)</p>
                        </div>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center px-8 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin w-4 h-4 mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Section'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

