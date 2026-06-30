import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiGet, apiPost, apiPut } from '../../utils/api';
import { Check, Edit, Trash2, X, Loader2 } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const steps = [
  { id: 1, name: 'Basic Information' },
  { id: 2, name: 'FAQ' },
  { id: 3, name: 'Banner Info' },
  { id: 4, name: 'Packages' },
  { id: 5, name: 'Page Content' }
];

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

export default function CategoryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stepParam = parseInt(searchParams.get('step')) || 1;
  
  const [currentStep, setCurrentStep] = useState(stepParam);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', slug: '', categoryType: 'Trek',
    showInHome: false, showInFooter: false,
    metaTitle: '', metaDescription: '', metaKeywords: '', canonical: '',
    faqs: [], bannerItems: [], packages: [], pageContent: '', isActive: true
  });

  useEffect(() => {
    setCurrentStep(stepParam);
  }, [stepParam]);

  useEffect(() => {
    let editorInstance = null;
    const initCKEditor = () => {
      if (!window.CKEDITOR) return;
      if (currentStep === 2) {
        if (window.CKEDITOR.instances.faqCatContent) window.CKEDITOR.instances.faqCatContent.destroy(true);
        editorInstance = window.CKEDITOR.replace('faqCatContent', { height: 200, versionCheck: false });
        editorInstance.on('change', () => {
          window.dispatchEvent(new CustomEvent('faqCatContentChange', { detail: editorInstance.getData() }));
        });
        window.faqCatEditor = editorInstance;
      }
      if (currentStep === 5) {
        if (window.CKEDITOR.instances.categoryContent) {
          window.CKEDITOR.instances.categoryContent.destroy(true);
        }
        editorInstance = window.CKEDITOR.replace('categoryContent', {
          height: 400,
          versionCheck: false,
        });
        editorInstance.on('instanceReady', () => {
          editorInstance.setData(formData.pageContent);
        });
        editorInstance.on('change', () => {
          setFormData(prev => ({ ...prev, pageContent: editorInstance.getData() }));
        });
      }
    };

    if (window.CKEDITOR) {
      initCKEditor();
    } else {
      const script = document.createElement('script');
      script.src = "https://cdn.ckeditor.com/4.22.1/full/ckeditor.js";
      script.async = true;
      script.onload = initCKEditor;
      document.body.appendChild(script);
    }

    return () => {
      if (window.CKEDITOR) {
        if (window.CKEDITOR.instances.faqCatContent) window.CKEDITOR.instances.faqCatContent.destroy(true);
        if (window.CKEDITOR.instances.categoryContent) window.CKEDITOR.instances.categoryContent.destroy(true);
      }
    };
  }, [currentStep, loading]);

  useEffect(() => {
    if (id !== '0') {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      const data = await apiGet(`/api/categories/${id}`);
      setFormData({
        name: data.name || '',
        slug: data.slug || '',
        categoryType: data.categoryType || 'Trek',
        showInHome: data.showInHome || false,
        showInFooter: data.showInFooter || false,
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        metaKeywords: data.metaKeywords || '',
        canonical: data.canonical || '',
        faqs: data.faqs || [],
        bannerItems: data.bannerItems || [],
        packages: data.packages || [],
        pageContent: data.pageContent || '',
        isActive: data.isActive !== false
      });
    } catch (err) {
      toast.error('Failed to load category');
    }
  };

  const handleStepClick = (stepId) => {
    navigate(`/dashboard/categories/${id}?step=${stepId}`);
  };

  const saveCurrentStep = async () => {
    setLoading(true);
    try {
      let savedCat;
      if (id === '0') {
        if (!formData.name) {
          toast.error("Category name required to create");
          setLoading(false);
          // Allow skip
          if (currentStep < 5) navigate(`/dashboard/categories/0?step=${currentStep + 1}`);
          return;
        }
        savedCat = await apiPost('/api/categories', formData);
        toast.success('Category drafted!');
        if (currentStep < 5) {
           navigate(`/dashboard/categories/${savedCat._id}?step=${currentStep + 1}`, { replace: true });
        } else {
           navigate('/dashboard/categories');
        }
      } else {
        savedCat = await apiPut(`/api/categories/${id}`, formData);
        if (savedCat) {
          setFormData(prev => ({ ...prev, ...savedCat }));
        }
        toast.success('Saved successfully');
        if (currentStep < 5) {
           navigate(`/dashboard/categories/${id}?step=${currentStep + 1}`);
        } else {
           navigate('/dashboard/categories');
        }
      }
    } catch (err) {
       toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      navigate(`/dashboard/categories/${id}?step=${currentStep - 1}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow min-h-[500px] p-6 mb-10">
      <h2 className="text-xl font-bold mb-8">Trek/Tour/Expedition Details</h2>
      
      <div className="hidden md:flex justify-between border-b pb-4 mb-8">
        {steps.map(step => {
          const active = currentStep === step.id;
          const passed = currentStep > step.id;
          return (
            <div 
               key={step.id} 
               onClick={() => handleStepClick(step.id)}
               className="flex flex-col items-center flex-1 cursor-pointer group"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition
                ${active ? 'bg-yellow-400 text-white' : passed ? 'bg-[#00A859] text-white' : 'bg-gray-200 text-gray-500 group-hover:bg-gray-300'}`}>
                {passed ? <Check size={16} /> : step.id}
              </div>
              <span className={`text-xs text-center font-medium ${active ? 'text-yellow-500' : passed ? 'text-[#00A859]' : 'text-gray-400'}`}>
                {step.name}
              </span>
            </div>
          )
        })}
      </div>

      <div className="min-h-[300px]">
        {currentStep === 1 && <Step1Basic formData={formData} setFormData={setFormData} />}
        {currentStep === 2 && <Step2FAQ formData={formData} setFormData={setFormData} />}
        {currentStep === 3 && <Step3Banner formData={formData} setFormData={setFormData} />}
        {currentStep === 4 && <Step4Packages formData={formData} setFormData={setFormData} />}
        {currentStep === 5 && <Step5Content formData={formData} setFormData={setFormData} />}
        
        <div className="mt-8 flex justify-between border-t border-gray-100 pt-6">
          <button 
             onClick={handlePrevious} 
             disabled={currentStep === 1}
             className="px-6 py-2 bg-gray-100 text-gray-700 rounded font-medium disabled:opacity-50"
          >
             Previous
          </button>
          
          <button 
             onClick={saveCurrentStep} 
             disabled={loading}
             className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded font-medium disabled:opacity-70 disabled:cursor-not-allowed transition"
          >
             {loading && <Loader2 size={18} className="animate-spin" />}
             {loading ? 'Saving...' : currentStep === 5 ? 'Submit' : 'Save & Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------------
function Step1Basic({ formData, setFormData }) {
  const onChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});
  const onCheck = (e) => setFormData({...formData, [e.target.name]: e.target.value === 'true'});

  return (
    <div className="space-y-6">
       <div className="flex gap-6">
          <div className="flex-1">
             <label className="block text-xs font-bold text-gray-500 mb-2"> Name *</label>
             <input type="text" name="name" className="w-full border p-2 rounded" value={formData.name} onChange={onChange}/>
          </div>
          <div className="flex-1">
             <label className="block text-xs font-bold text-gray-500 mb-2">Slug</label>
             <input type="text" name="slug" className="w-full border p-2 rounded" value={formData.slug} onChange={onChange}/>
          </div>
       </div>
       <div className="flex gap-6">
          <div className="flex-1">
             <label className="block text-xs font-bold text-gray-500 mb-2">Type</label>
             <select name="categoryType" className="w-full border p-2 rounded" value={formData.categoryType} onChange={onChange}>
                <option value="Trek">Trek</option>
                <option value="Tour">Tour</option>
                <option value="Expedition">Expedition</option>
                   <option value="Others">Others</option>
             </select>
          </div>
          <div className="flex-1">
             <label className="block text-xs font-bold text-gray-500 mb-2">Show In Home Page ?</label>
             <select name="showInHome" className="w-full border p-2 rounded" value={formData.showInHome} onChange={onCheck}>
                <option value="true">Yes</option>
                <option value="false">No</option>
             </select>
          </div>
       </div>
       <div className="flex gap-6">
          <div className="flex-1">
             <label className="block text-xs font-bold text-gray-500 mb-2">Show In Footer ?</label>
             <select name="showInFooter" className="w-full border p-2 rounded" value={formData.showInFooter} onChange={onCheck}>
                <option value="true">Yes</option>
                <option value="false">No</option>
             </select>
          </div>
          <div className="flex-1">
             <label className="block text-xs font-bold text-gray-500 mb-2">Meta Title</label>
             <input type="text" name="metaTitle" className="w-full border p-2 rounded" value={formData.metaTitle} onChange={onChange}/>
          </div>
       </div>
       <div className="flex gap-6">
          <div className="flex-1">
             <label className="block text-xs font-bold text-gray-500 mb-2">Meta Description</label>
             <input type="text" name="metaDescription" className="w-full border p-2 rounded" value={formData.metaDescription} onChange={onChange}/>
          </div>
          <div className="flex-1">
             <label className="block text-xs font-bold text-gray-500 mb-2">Meta Keywords</label>
             <input type="text" name="metaKeywords" className="w-full border p-2 rounded" value={formData.metaKeywords} onChange={onChange}/>
          </div>
       </div>
       <div className="flex gap-6">
          <div className="flex-1">
             <label className="block text-xs font-bold text-gray-500 mb-2">Canonical</label>
             <input type="text" name="canonical" className="w-full border p-2 rounded" value={formData.canonical} onChange={onChange}/>
          </div>
       </div>
    </div>
  );
}

// --------------------------------------------------------------------------------------
function Step2FAQ({ formData, setFormData }) {
  const [item, setItem] = useState({ heading: '', content: '' });
  const [editingIdx, setEditingIdx] = useState(null);

  const saveItem = () => {
    if (!item.heading) return;
    if (editingIdx !== null) {
      const updated = [...formData.faqs];
      updated[editingIdx] = item;
      setFormData(prev => ({ ...prev, faqs: updated }));
      setEditingIdx(null);
    } else {
      setFormData(prev => ({ ...prev, faqs: [...prev.faqs, item] }));
    }
    setItem({ heading: '', content: '' });
    if (window.faqCatEditor) window.faqCatEditor.setData('');
  };

  const editItem = (idx) => {
    const faq = formData.faqs[idx];
    setItem({ ...faq });
    setEditingIdx(idx);
    const trySetData = (attempts) => {
      if (window.faqCatEditor && window.faqCatEditor.status === 'ready') {
        window.faqCatEditor.setData(faq.content || '');
      } else if (attempts < 20) {
        setTimeout(() => trySetData(attempts + 1), 100);
      }
    };
    setTimeout(() => trySetData(0), 50);
  };

  const cancelEdit = () => {
    setEditingIdx(null);
    setItem({ heading: '', content: '' });
    if (window.faqCatEditor) window.faqCatEditor.setData('');
  };

  const removeItem = (idx) => {
    if (editingIdx === idx) { setEditingIdx(null); setItem({ heading: '', content: '' }); }
    setFormData(prev => ({ ...prev, faqs: prev.faqs.filter((_, i) => i !== idx) }));
  };

  useEffect(() => {
    const handler = (e) => setItem(prev => ({ ...prev, content: e.detail }));
    window.addEventListener('faqCatContentChange', handler);
    return () => window.removeEventListener('faqCatContentChange', handler);
  }, []);

  return (
    <div>
       <h3 className="font-bold text-gray-800 mb-4 text-lg">FAQ Editor</h3>
       <div className={`space-y-4 mb-8 p-4 rounded-lg border ${editingIdx !== null ? 'border-blue-400 bg-blue-50' : 'border-transparent'}`}>
         {editingIdx !== null && <p className="text-xs font-semibold text-blue-600">Editing FAQ #{editingIdx + 1}</p>}
         <div>
           <label className="block text-xs font-bold mb-2">Question</label>
           <input type="text" className="w-full border p-2 mb-2" placeholder="Enter question" value={item.heading} onChange={e => setItem({...item, heading: e.target.value})} />
         </div>
         <div className="pb-4">
           <label className="block text-xs font-bold mb-2">Answer</label>
           <div className="bg-white border rounded-lg overflow-hidden">
             <textarea id="faqCatContent" defaultValue={item.content}></textarea>
           </div>
         </div>
         <div className="flex gap-2">
           <button onClick={saveItem} className="bg-primary-600 text-white px-6 py-2 rounded text-sm">
             {editingIdx !== null ? 'Update FAQ' : 'Submit FAQ'}
           </button>
           {editingIdx !== null && (
             <button onClick={cancelEdit} className="bg-gray-200 text-gray-700 px-6 py-2 rounded text-sm">Cancel</button>
           )}
         </div>
       </div>

       <div className="mt-4 space-y-2">
         {formData.faqs.map((f, i) => (
            <div key={i} className={`border p-3 rounded relative group pr-16 text-sm ${editingIdx === i ? 'border-blue-400 bg-blue-50' : 'bg-white'}`}>
               <strong>{f.heading}</strong>
               {editingIdx === i && <span className="ml-2 text-xs text-blue-500 font-medium">(editing...)</span>}
               <div className="text-gray-600 mt-1" dangerouslySetInnerHTML={{__html: f.content}}></div>
               <div className="absolute top-[50%] -translate-y-1/2 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                 <button onClick={() => editItem(i)} className="text-blue-500 bg-gray-100 p-1 rounded hover:text-blue-700"><Edit size={16}/></button>
                 <button onClick={() => removeItem(i)} className="text-red-500 bg-gray-100 p-1 rounded hover:text-red-700"><Trash2 size={16}/></button>
               </div>
            </div>
         ))}
       </div>
    </div>
  );
}

// --------------------------------------------------------------------------------------
function Step3Banner({ formData, setFormData }) {
  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData(prev => ({ ...prev, bannerItems: [...(prev.bannerItems || []), ev.target.result] }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = ''; // Reset input
  };
  const removeImage = (idx) => setFormData(prev => ({ ...prev, bannerItems: (prev.bannerItems || []).filter((_, i) => i !== idx) }));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-800 text-lg">Media Gallery</h3>
        <label className="bg-primary-600 text-white px-4 py-2 rounded font-medium cursor-pointer">
           + Add Media Item
           <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {formData.bannerItems.map((img, i) => (
            <div key={i} className="relative group border rounded p-2 bg-gray-50">
              <img src={img} alt="Banner" className="w-full h-32 object-cover rounded" />
              <button 
                type="button" 
                onClick={() => removeImage(i)} 
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 shadow-md hover:bg-red-700 transition"
              >
                 <X size={14} />
              </button>
            </div>
        ))}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------------
function Step4Packages({ formData, setFormData }) {
  const [availablePackages, setAvailablePackages] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    apiGet('/api/packages').then(data => setAvailablePackages(data.data || data || []));
  }, []);

  const openModal = () => {
    setSelectedIds(formData.packages);
    setModalOpen(true);
  };

  const toggleSelection = (pkgId) => {
    if (selectedIds.includes(pkgId)) setSelectedIds(selectedIds.filter(id => id !== pkgId));
    else setSelectedIds([...selectedIds, pkgId]);
  };

  const saveSelections = () => {
    setFormData(prev => ({ ...prev, packages: selectedIds }));
    setModalOpen(false);
  };

  return (
    <div>
       <div className="flex justify-between border-b pb-4 mb-4">
         <h3 className="font-bold text-gray-800 text-lg">Category Packages</h3>
         <button onClick={openModal} className="bg-primary-600 text-white px-4 py-2 rounded font-medium">+ Choose Packages</button>
       </div>
       
       <div className="space-y-2">
         {formData.packages.map(pId => {
            const pkg = availablePackages.find(p => p._id === pId);
            return (
              <div key={pId} className="p-3 border rounded flex justify-between">
                <span>{pkg ? pkg.packageName : pId}</span>
                <button onClick={() => setFormData(prev => ({...prev, packages: prev.packages.filter(i => i !== pId)}))} className="text-red-500"><Trash2 size={16}/></button>
              </div>
            );
         })}
       </div>

       {modalOpen && (
         <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-lg relative max-h-[80vh] overflow-y-auto">
               <h3 className="font-bold mb-4">Choose Packages</h3>
               <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4"><X size={18}/></button>
               <div className="space-y-3 mb-6">
                 {availablePackages.map(pkg => (
                    <label key={pkg._id} className="flex items-center gap-3 cursor-pointer">
                       <input type="checkbox" checked={selectedIds.includes(pkg._id)} onChange={() => toggleSelection(pkg._id)} className="w-4 h-4 text-green-600 rounded" />
                       <span>{pkg.packageName}</span>
                    </label>
                 ))}
               </div>
               <button onClick={saveSelections} className="bg-[#00A859] text-white px-6 py-2 rounded w-full">Done</button>
            </div>
         </div>
       )}
    </div>
  );
}

// --------------------------------------------------------------------------------------
function Step5Content({ formData, setFormData }) {
  return (
    <div>
       <h3 className="font-bold text-gray-800 mb-6 text-lg">Page Content</h3>
       <div className="bg-white border rounded-md overflow-hidden">
         <textarea id="categoryContent" defaultValue={formData.pageContent}></textarea>
       </div>
    </div>
  );
}

