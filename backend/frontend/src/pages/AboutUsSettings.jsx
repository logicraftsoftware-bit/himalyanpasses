import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, Save, X, Image as ImageIcon, Eye, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { API_BASE, apiPutForm } from '../utils/api';

export default function AboutUsSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [heading, setHeading] = useState('');
  const [pageName, setPageName] = useState('');
  const [slug, setSlug] = useState('about-us');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]); // Existing images from DB
  const [newImages, setNewImages] = useState([]); // Files selected
  const [imagePreviews, setImagePreviews] = useState([]); // Local previews for new files

  const [highlights, setHighlights] = useState([]);
  const [missionVision, setMissionVision] = useState([]);

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    let editorInstance = null;
    const script = document.createElement('script');
    script.src = "https://cdn.ckeditor.com/4.22.1/full/ckeditor.js";
    script.async = true;
    script.onload = () => {
      if (window.CKEDITOR && document.getElementById('aboutContent')) {
        if (window.CKEDITOR.instances.aboutContent) {
          window.CKEDITOR.instances.aboutContent.destroy(true);
        }
        editorInstance = window.CKEDITOR.replace('aboutContent', {
          height: 300,
          versionCheck: false,
        });
        if (editorInstance) {
          editorInstance.on('instanceReady', () => {
            editorInstance.setData(content);
          });
          editorInstance.on('change', () => {
            setContent(editorInstance.getData());
          });
        }
      }
    };
    document.body.appendChild(script);
    
    return () => {
      if (window.CKEDITOR && window.CKEDITOR.instances.aboutContent) {
        window.CKEDITOR.instances.aboutContent.destroy(true);
      }
    };
  }, [loading]); // Re-init after initial data load

  const modules = {
    toolbar: [
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
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background', 'align', 'script', 'code-block', 'direction'
  ];

  useEffect(() => {
    fetchAboutUs();
  }, []);

  const fetchAboutUs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/about-us`);
      const data = await res.json();
      if (data) {
        setHeading(data.heading || '');
        setPageName(data.pageName || '');
        setSlug(data.slug || 'about-us');
        setMetaTitle(data.metaTitle || '');
        setMetaKeywords(data.metaKeywords || '');
        setMetaDescription(data.metaDescription || '');
        setContent(data.content || '');
        setImages(data.images || []);
        setHighlights(data.highlights || []);
        setMissionVision(data.missionVision || []);
      }
    } catch (err) {
      toast.error('Failed to load About Us details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    setNewImages((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeExistingImage = (publicId) => {
    setImages(images.filter((img) => img.publicId !== publicId));
  };

  const removeNewImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleAddHighlight = () => setHighlights([...highlights, { iconUrl: '', iconPublicId: '', iconBase64: '', subheading: '', text: '' }]);
  const handleRemoveHighlight = (index) => setHighlights(highlights.filter((_, i) => i !== index));
  const handleHighlightChange = (index, field, value) => {
    const arr = [...highlights];
    arr[index][field] = value;
    setHighlights(arr);
  };

  const handleAddMissionVision = () => setMissionVision([...missionVision, { iconUrl: '', iconPublicId: '', iconBase64: '', heading: '', text: '' }]);
  const handleRemoveMissionVision = (index) => setMissionVision(missionVision.filter((_, i) => i !== index));
  const handleMissionVisionChange = (index, field, value) => {
    const arr = [...missionVision];
    arr[index][field] = value;
    setMissionVision(arr);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('heading', heading);
      formData.append('pageName', pageName);
      formData.append('slug', slug);
      formData.append('metaTitle', metaTitle);
      formData.append('metaKeywords', metaKeywords);
      formData.append('metaDescription', metaDescription);
      formData.append('content', content);
      formData.append('highlights', JSON.stringify(highlights));
      formData.append('missionVision', JSON.stringify(missionVision));
      formData.append('retainedImages', JSON.stringify(images));

      newImages.forEach((file) => formData.append('images', file));

      await apiPutForm('/api/about-us', formData);

      toast.success('About Us updated successfully');
      setNewImages([]);
      setImagePreviews([]);
      fetchAboutUs();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading About Us Settings...</div>;
  }

  return (
    <div className="p-6  mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">About Page Settings</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Eye size={18} />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Heading & SEO Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
              <input
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 bg-gray-50/50"
                placeholder="About Our Company..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Page Name</label>
              <input
                type="text"
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 bg-gray-50/50"
                placeholder="About Us"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 bg-gray-50/50"
                placeholder="about-us"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 bg-gray-50/50"
                placeholder="SEO Meta Title"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
              <input
                type="text"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 bg-gray-50/50"
                placeholder="keyword1, keyword2..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 bg-gray-50/50 h-10"
                placeholder="SEO Meta Description"
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Content (Editor/HTML)</label>
             <div className="bg-white border rounded-lg overflow-hidden">
                <textarea id="aboutContent" defaultValue={content}></textarea>
             </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">About Page Images (Multiple)</h2>
          
          <div className="mt-2 text-sm text-gray-600">
             <label className="inline-block px-4 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50">
               <span className="flex items-center gap-2">
                 <ImageIcon size={18} /> Select Images
               </span>
               <input
                 type="file"
                 multiple
                 accept="image/*"
                 className="hidden"
                 onChange={handleFileChange}
               />
             </label>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-4">
            {images.map((img) => (
              <div key={img.publicId} className="relative group rounded-lg overflow-hidden border">
                <img src={img.url} alt="Existing" className="w-full h-24 object-cover" />
                <button
                  type="button"
                  onClick={() => removeExistingImage(img.publicId)}
                  className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-white text-red-500 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {imagePreviews.map((url, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden border border-primary-300">
                <img src={url} alt="New Preview" className="w-full h-24 object-cover opacity-80" />
                <button
                  type="button"
                  onClick={() => removeNewImage(i)}
                  className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-white text-red-500 rounded backdrop-blur-sm"
                >
                  <X size={14} />
                </button>
                <div className="absolute inset-x-0 bottom-0 bg-primary-600/80 text-white text-[10px] text-center p-0.5">
                  New
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-lg font-semibold">Why To Choose Us (Icon Name + Subheading + Text)</h2>
          <button onClick={handleAddHighlight} className="text-sm flex items-center gap-1 text-primary-600 hover:text-primary-800">
            <Plus size={16} /> Add Highlight
          </button>
        </div>
        
        <div className="space-y-4">
          {highlights.map((h, index) => (
            <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg border border-gray-100 relative group">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                <div className="flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2">
                    {h.iconUrl ? (
                      <img src={h.iconUrl} alt="icon" className="w-10 h-10 object-cover rounded border" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-400">Icon</div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const arr = [...highlights];
                            arr[index].iconBase64 = reader.result;
                            arr[index].iconUrl = reader.result;
                            setHighlights(arr);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-xs w-full"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Subheading"
                  value={h.subheading}
                  onChange={(e) => handleHighlightChange(index, 'subheading', e.target.value)}
                  className="w-full rounded-lg border-gray-300 text-sm"
                />
                <textarea
                  placeholder="Short Description text"
                  value={h.text}
                  onChange={(e) => handleHighlightChange(index, 'text', e.target.value)}
                  className="w-full rounded-lg border-gray-300 text-sm h-10"
                />
              </div>
              <button
                onClick={() => handleRemoveHighlight(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-1"
                title="Remove"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {highlights.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No highlights added yet.</p>}
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-lg font-semibold">Mission & Vision Section</h2>
          <button onClick={handleAddMissionVision} className="text-sm flex items-center gap-1 text-primary-600 hover:text-primary-800">
            <Plus size={16} /> Add Section
          </button>
        </div>
        
        <div className="space-y-4">
          {missionVision.map((mv, index) => (
            <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg border border-gray-100 relative group">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                 <div className="flex gap-4">
                    <div className="w-1/2 flex flex-col items-start gap-2">
                      <div className="flex items-center gap-2">
                        {mv.iconUrl ? (
                          <img src={mv.iconUrl} alt="icon" className="w-10 h-10 object-cover rounded border" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-400">Icon</div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const arr = [...missionVision];
                                arr[index].iconBase64 = reader.result;
                                arr[index].iconUrl = reader.result;
                                setMissionVision(arr);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="text-xs w-full max-w-[150px]"
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Heading (e.g., Our Mission)"
                      value={mv.heading}
                      onChange={(e) => handleMissionVisionChange(index, 'heading', e.target.value)}
                      className="w-1/2 rounded-lg border-gray-300 text-sm"
                    />
                 </div>
                 <textarea
                   placeholder="Textarea for Description..."
                   value={mv.text}
                   onChange={(e) => handleMissionVisionChange(index, 'text', e.target.value)}
                   className="w-full rounded-lg border-gray-300 text-sm h-16"
                 />
              </div>
              <button
                onClick={() => handleRemoveMissionVision(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-1"
                title="Remove"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {missionVision.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No Mission/Vision section added yet.</p>}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">About Page Preview</h2>
              <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-800">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8 flex-1">
               {/* Heading & Content */}
               <div className="space-y-4">
                 <h1 className="text-3xl font-bold text-gray-900">{heading || 'No Heading'}</h1>
                 <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: content }} />
               </div>

               {/* Images */}
               {images.length > 0 && (
                 <div>
                   <h3 className="text-xl font-semibold mb-4 border-b pb-2">Images</h3>
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                     {images.map(img => (
                       <img key={img.publicId} src={img.url} alt="about" className="w-full h-32 object-cover rounded-lg shadow-sm" />
                     ))}
                   </div>
                 </div>
               )}

               {/* Highlights */}
               {highlights.length > 0 && (
                 <div>
                   <h3 className="text-xl font-semibold mb-4 border-b pb-2">Highlights</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                     {highlights.map((hl, i) => (
                       <div key={i} className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
                         {hl.iconUrl && <img src={hl.iconUrl} alt="icon" className="w-12 h-12 mb-2" />}
                         <h4 className="font-bold text-lg">{hl.subheading}</h4>
                         <p className="text-gray-600 text-sm mt-1">{hl.text}</p>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* Mission Vision */}
               {missionVision.length > 0 && (
                 <div>
                   <h3 className="text-xl font-semibold mb-4 border-b pb-2">Mission & Vision</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {missionVision.map((mv, i) => (
                       <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                         {mv.iconUrl && <img src={mv.iconUrl} alt="icon" className="w-16 h-16 flex-shrink-0" />}
                         <div>
                           <h4 className="font-bold text-lg mb-1">{mv.heading}</h4>
                           <p className="text-gray-600 text-sm">{mv.text}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

