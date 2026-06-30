import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiGet, apiPost, apiPut } from '../../utils/api';
import { Check, Edit, Trash2, X, Loader2 } from 'lucide-react';
import div from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const steps = [
  { id: 1, name: 'Basic Information' },
  { id: 2, name: 'Departure Date' },
  { id: 3, name: 'Overview' },
  { id: 4, name: 'Trip Itinerary' },
  { id: 5, name: 'FAQ' },
  { id: 6, name: 'Tab' },
  { id: 7, name: 'Gallery' },
  { id: 8, name: 'SEO' },
  { id: 9, name: 'Other Options' },
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

export default function PackageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentStep = parseInt(searchParams.get('step') || '1', 10);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [additionalsList, setAdditionalsList] = useState([]);

  // Form State matching Package Model
  const [formData, setFormData] = useState({
    packageName: '', slug: '', duration: '', shortDescription: '',
    region: '', bestTime: '', highestAltitude: '', suitableFor: '',
    trekDistance: '', difficulty: '', originalPriceINR: 0, offerPriceINR: 0,
    originalPriceUSD: 0, offerPriceUSD: 0, isActive: true,
    thumbnail: '', thumbnailBase64: '',
    additionals: [],
    trekInsuranceAmount: 0, travelFee: 0,
    departureDates: [], overview: '', itineraries: [], faqs: [],
    tabs: [],
    gallery: [], seo: { title: '', description: '', keywords: '', canonical: '' }, otherOptions: []
  });

  useEffect(() => {
    let editorInstance = null;
    const script = document.createElement('script');
    script.src = "https://cdn.ckeditor.com/4.22.1/full/ckeditor.js";
    script.async = true;
    script.onload = () => {
      if (window.CKEDITOR) {
        if (currentStep === 3) {
          if (window.CKEDITOR.instances.overviewContent) window.CKEDITOR.instances.overviewContent.destroy(true);
          editorInstance = window.CKEDITOR.replace('overviewContent', { height: 300, versionCheck: false });
          editorInstance.on('instanceReady', () => editorInstance.setData(formData.overview));
          editorInstance.on('change', () => setFormData(prev => ({ ...prev, overview: editorInstance.getData() })));
        }
        if (currentStep === 4) {
          if (window.CKEDITOR.instances.itineraryContent) window.CKEDITOR.instances.itineraryContent.destroy(true);
          editorInstance = window.CKEDITOR.replace('itineraryContent', { height: 250, versionCheck: false });
          editorInstance.on('change', () => {
            window.dispatchEvent(new CustomEvent('itineraryContentChange', { detail: editorInstance.getData() }));
          });
          window.itineraryEditor = editorInstance;
        }
        if (currentStep === 5) {
          if (window.CKEDITOR.instances.faqContent) window.CKEDITOR.instances.faqContent.destroy(true);
          editorInstance = window.CKEDITOR.replace('faqContent', { height: 200, versionCheck: false });
          editorInstance.on('change', () => {
            window.dispatchEvent(new CustomEvent('faqContentChange', { detail: editorInstance.getData() }));
          });
          window.faqEditor = editorInstance;
        }
        if (currentStep === 9) {
          if (window.CKEDITOR.instances.otherOptionContent) window.CKEDITOR.instances.otherOptionContent.destroy(true);
          editorInstance = window.CKEDITOR.replace('otherOptionContent', { height: 250, versionCheck: false });
          editorInstance.on('change', () => {
            window.dispatchEvent(new CustomEvent('otherOptionContentChange', { detail: editorInstance.getData() }));
          });
          window.otherOptionEditor = editorInstance;
        }
      }
    };
    document.body.appendChild(script);
    return () => {
      if (window.CKEDITOR) {
        if (window.CKEDITOR.instances.overviewContent) window.CKEDITOR.instances.overviewContent.destroy(true);
        if (window.CKEDITOR.instances.itineraryContent) window.CKEDITOR.instances.itineraryContent.destroy(true);
        if (window.CKEDITOR.instances.faqContent) window.CKEDITOR.instances.faqContent.destroy(true);
        if (window.CKEDITOR.instances.otherOptionContent) window.CKEDITOR.instances.otherOptionContent.destroy(true);
      }
    };
  }, [currentStep, loading]);

  useEffect(() => {
    loadDependencies();
    if (id && id !== '0' && id !== 'new') {
      loadPackage();
    }
  }, [id]);

  const loadDependencies = async () => {
    try {
      const adds = await apiGet('/api/additionals').catch(() => []);
      setAdditionalsList(adds);
    } catch { }
  };

  const loadPackage = async () => {
    setLoading(true);
    try {
      const pkg = await apiGet(`/api/packages/${id}`);
      setFormData(prev => ({
        ...prev,
        ...pkg,
        additionals: pkg.additionals?.map(a => a._id || a) || []
      }));
    } catch (err) {
      toast.error('Failed to load package');
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step) => {
    return null;
  };

  const saveCurrentStep = async () => {
    const error = validateStep(currentStep);
    if (error) {
      toast.error(error);
      return;
    }

    setSaving(true);
    try {
      let savedPkg;
      if (id && id !== '0' && id !== 'new') {
        savedPkg = await apiPut(`/api/packages/${id}`, formData);
        toast.success('Saved step successfully');
      } else {
        savedPkg = await apiPost('/api/packages', formData);
        toast.success('Package draft created');
      }

      if (savedPkg) {
        setFormData(prev => ({
          ...prev,
          ...savedPkg,
          thumbnailBase64: '',
          additionals: savedPkg.additionals?.map(a => a._id || a) || []
        }));
      }

      const targetId = savedPkg ? savedPkg._id : id;

      if (currentStep < steps.length) {
        navigate(`/dashboard/packages/${targetId}?step=${currentStep + 1}`);
      } else {
        navigate('/packages');
      }
    } catch (err) {
      toast.error('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'packageName') {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      return updated;
    });
  };

  const handleStepClick = (stepId) => {
    if (stepId > currentStep) {
      const error = validateStep(currentStep);
      if (error) {
        toast.error(error);
        return;
      }
    }
    navigate(`/dashboard/packages/${id}?step=${stepId}`);
  };

  const renderStepIndicator = () => (
    <div className="flex justify-between items-center mb-8 mt-4 overflow-x-auto pb-4">
      {steps.map(s => {
        const isActive = s.id === currentStep;
        const isPast = s.id < currentStep;
        return (
          <div
            key={s.id}
            className="flex flex-col items-center flex-1 min-w-[80px] cursor-pointer"
            onClick={() => handleStepClick(s.id)}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition-colors
              ${isActive ? 'bg-[#FFB703] text-white' : isPast ? 'bg-[#00A859] text-white' : 'bg-gray-200 text-gray-400'}
            `}>
              {isPast ? <Check size={18} /> : s.id}
            </div>
            <span className={`text-xs text-center font-medium ${isActive ? 'text-[#FFB703]' : isPast ? 'text-[#00A859]' : 'text-gray-400'}`}>
              {s.name}
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Single Package Details</h1>
      {renderStepIndicator()}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
        {currentStep === 1 && <Step1Basic formData={formData} onChange={handleTextChange} additionalsList={additionalsList} setFormData={setFormData} />}
        {currentStep === 2 && <Step2Departure formData={formData} setFormData={setFormData} />}
        {currentStep === 3 && <Step3Overview formData={formData} setFormData={setFormData} />}
        {currentStep === 4 && <Step4Itinerary formData={formData} setFormData={setFormData} />}
        {currentStep === 5 && <Step5FAQ formData={formData} setFormData={setFormData} />}
        {currentStep === 6 && <Step6Tab formData={formData} setFormData={setFormData} />}
        {currentStep === 7 && <Step7Gallery formData={formData} setFormData={setFormData} />}
        {currentStep === 8 && <Step8SEO formData={formData} setFormData={setFormData} />}
        {currentStep === 9 && <Step9OtherOptions formData={formData} setFormData={setFormData} />}

        <div className="mt-8 flex justify-between border-t border-gray-100 pt-6">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => navigate(`/dashboard/packages/${id}?step=${currentStep - 1}`)}
            className="px-6 py-2 bg-gray-100 text-gray-600 rounded font-medium disabled:opacity-50"
          >
            Previous
          </button>

          <button
            onClick={saveCurrentStep}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded font-medium transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving && <Loader2 size={18} className="animate-spin" />}
            {saving ? 'Saving...' : (currentStep === steps.length ? 'Finish' : 'Save & Next')}
          </button>
        </div>
      </div>
    </div>
  );
}

const InputRow = ({ label, name, value, onChange, placeholder, type = "text" }) => (
  <div className="flex-1">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{label}</label>
    <input type={type} name={name} value={value || ''} onChange={onChange} placeholder={placeholder}
      className="w-full border border-gray-200 rounded p-2 focus:border-green-400 outline-none" />
  </div>
);

// -------------------------------------------------------------
// STEP 1: Basic Info
// -------------------------------------------------------------
function Step1Basic({ formData, onChange, additionalsList, setFormData }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleAdditional = (id) => {
    const isSelected = formData.additionals?.includes(id);
    let newAdd = [];
    if (isSelected) newAdd = formData.additionals.filter(a => a !== id);
    else newAdd = [...(formData.additionals || []), id];
    setFormData(prev => ({ ...prev, additionals: newAdd }));
  };

  const toggleAll = () => {
    if (formData.additionals?.length === additionalsList.length) {
      setFormData(prev => ({ ...prev, additionals: [] }));
    } else {
      setFormData(prev => ({ ...prev, additionals: additionalsList.map(a => a._id) }));
    }
  };

  const filteredAdditionals = additionalsList?.filter(a => (a.name || '').toLowerCase().includes(searchTerm.toLowerCase())) || [];

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        <InputRow label="Package Name" name="packageName" value={formData.packageName} onChange={onChange} placeholder="Enter package name" />
        <InputRow label="Slug" name="slug" value={formData.slug} onChange={onChange} placeholder="Enter slug" />
      </div>
      <div className="flex gap-6">
        <InputRow label="Duration" name="duration" value={formData.duration} onChange={onChange} placeholder="Enter duration" />
        <InputRow label="Short Description" name="shortDescription" value={formData.shortDescription} onChange={onChange} placeholder="Enter short description" />
      </div>
      <div className="flex gap-6">
        <InputRow label="Region" name="region" value={formData.region} onChange={onChange} placeholder="Enter region" />
        <InputRow label="Best Time" name="bestTime" value={formData.bestTime} onChange={onChange} placeholder="Enter best time" />
      </div>
      <div className="flex gap-6">
        <InputRow label="Highest Altitude" name="highestAltitude" value={formData.highestAltitude} onChange={onChange} placeholder="Enter highest altitude" />
        <InputRow label="Suitable For" name="suitableFor" value={formData.suitableFor} onChange={onChange} placeholder="Enter suitable for" />
      </div>
      <div className="flex gap-6">
        <InputRow label="Trek Distance" name="trekDistance" value={formData.trekDistance} onChange={onChange} placeholder="Enter trek distance" />
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Difficulty</label>
          <select name="difficulty" value={formData.difficulty} onChange={onChange} className="w-full border border-gray-200 rounded p-2 focus:border-green-400 outline-none">
            <option value="">None</option>
            <option value="Easy">Easy</option>
            <option value="Easy To Moderate">Easy To Moderate</option>
            <option value="Moderate">Moderate</option>
            <option value="Moderate To Difficult">Moderate To Difficult</option>
            <option value="Difficult">Difficult</option>
            <option value="Challenging">Challenging</option>
          </select>
        </div>
      </div>
      <div className="flex gap-6">
        <InputRow label="Original Price INR" name="originalPriceINR" value={formData.originalPriceINR} onChange={onChange} type="number" />
        <InputRow label="Offer Price INR" name="offerPriceINR" value={formData.offerPriceINR} onChange={onChange} type="number" />
      </div>
      <div className="flex gap-6">
        <InputRow label="Original Price USD" name="originalPriceUSD" value={formData.originalPriceUSD} onChange={onChange} type="number" />
        <InputRow label="Offer Price USD" name="offerPriceUSD" value={formData.offerPriceUSD} onChange={onChange} type="number" />
      </div>
      <div className="flex gap-6">
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Is Active</label>
          <select name="isActive" value={formData.isActive} onChange={(e) => onChange({ target: { name: 'isActive', value: e.target.value === 'true' } })} className="w-full border border-gray-200 rounded p-2 focus:border-green-400 outline-none">
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Choose Additionals</label>
          <div className="relative">
            <div onClick={() => setDropdownOpen(!dropdownOpen)} className="w-full border border-gray-200 rounded p-2 cursor-pointer bg-white flex justify-between items-center text-sm">
              <span className="truncate text-gray-600">{formData.additionals?.length ? `${formData.additionals.length} options selected` : 'Select options'}</span>
              <span className="text-gray-400 text-xs">â–¼</span>
            </div>
            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 max-h-60 flex flex-col">
                <div className="p-2 border-b sticky top-0 bg-white">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-2 flex items-center text-gray-400"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></span>
                    <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-8 pr-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-green-400" />
                  </div>
                </div>
                <div className="overflow-y-auto p-2 text-sm flex-1">
                  <label className="flex items-center gap-2 p-1.5 hover:bg-gray-100 cursor-pointer rounded">
                    <input type="checkbox" checked={formData.additionals?.length === additionalsList?.length && additionalsList?.length > 0} onChange={toggleAll} className="w-4 h-4 rounded border-gray-300 text-green-600" />
                    <span className="font-semibold text-gray-700">(Select All)</span>
                  </label>
                  {filteredAdditionals.map(a => (
                    <label key={a._id} className="flex items-center gap-2 p-1.5 hover:bg-gray-100 cursor-pointer rounded">
                      <input type="checkbox" checked={formData.additionals?.includes(a._id) || false} onChange={() => toggleAdditional(a._id)} className="w-4 h-4 rounded border-gray-300 text-green-600" />
                      <span className="text-gray-700">{a.name} (â‚¹{a.priceINR || 0}), (${a.priceUSD || 0})</span>
                    </label>
                  ))}
                  {filteredAdditionals.length === 0 && <p className="text-gray-400 p-2 text-xs text-center">No additionals found.</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      <div className="flex gap-6">
        <InputRow label="Trek Insurance Amount" name="trekInsuranceAmount" value={formData.trekInsuranceAmount} onChange={onChange} type="number" />
        <InputRow label="Travel Fee" name="travelFee" value={formData.travelFee} onChange={onChange} type="number" />
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// STEP 2: Departure Date
// -------------------------------------------------------------
function Step2Departure({ formData, setFormData }) {
  const [modalOpen, setModalOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const YEARS = Array.from({ length: 41 }, (_, i) => 2000 + i); // 2000 â€“ 2040

  const BLANK_ITEM = { month: '', year: String(currentYear), fromDate: '', toDate: '', maxSeats: '0', availabilityText: 'Available', availabilityTextColor: 'Green', visible: true };
  const [item, setItem] = useState(BLANK_ITEM);
  const [editingIdx, setEditingIdx] = useState(null);
  const [customYear, setCustomYear] = useState(false); // true when "Other..." is selected

  const saveItem = (e) => {
    e.preventDefault();
    if (editingIdx !== null) {
      const updated = [...formData.departureDates];
      updated[editingIdx] = item;
      setFormData(prev => ({ ...prev, departureDates: updated }));
      setEditingIdx(null);
    } else {
      setFormData(prev => ({ ...prev, departureDates: [...prev.departureDates, item] }));
    }
    setModalOpen(false);
    setCustomYear(false);
    setItem(BLANK_ITEM);

  };

  const editItem = (idx) => {
    const it = formData.departureDates[idx];
    const savedYear = it.year || '';
    // if saved year is outside the dropdown list, open in custom input mode
    setCustomYear(!!savedYear && !YEARS.includes(Number(savedYear)));
    setItem({
      ...it,
      year: savedYear || String(currentYear),
      fromDate: it.fromDate ? new Date(it.fromDate).toISOString().split('T')[0] : '',
      toDate: it.toDate ? new Date(it.toDate).toISOString().split('T')[0] : ''
    });
    setEditingIdx(idx);
    setModalOpen(true);
  };

  const removeItem = (idx) => {
    if (editingIdx === idx) { setEditingIdx(null); }
    setFormData(prev => ({ ...prev, departureDates: prev.departureDates.filter((_, i) => i !== idx) }));
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingIdx(null);
    setCustomYear(false);
    setItem(BLANK_ITEM);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setModalOpen(true)} className="px-4 py-2 bg-primary-600 text-white rounded text-sm">+ Add</button>
      </div>
      {formData.departureDates.length === 0 ? <p className="text-gray-400">No dates added yet.</p> : (
        <table className="w-full text-left border">
          <thead className="bg-gray-50 border-b"><tr className="*:p-3 *:text-sm *:font-semibold">
            <th>Month</th><th>Year</th><th>From</th><th>To</th><th>Seats</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {formData.departureDates.map((d, i) => (
              <tr key={i} className={`border-b *:p-3 text-sm ${editingIdx === i ? 'bg-blue-50' : ''}`}>
                <td>{d.month}</td>
                <td>{d.year || ''}</td>
                <td>{d.fromDate ? new Date(d.fromDate).toLocaleDateString() : ''}</td>
                <td>{d.toDate ? new Date(d.toDate).toLocaleDateString() : ''}</td>
                <td>{d.maxSeats}</td>
                <td><span className="text-green-600">{d.availabilityText}</span></td>
                <td>
                  <button type="button" onClick={() => editItem(i)} className="text-blue-500 mr-3 hover:text-blue-700"><Edit size={16} /></button>
                  <button type="button" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
            <h3 className="font-bold mb-4">{editingIdx !== null ? 'Edit Item' : 'Add New Item'}</h3>
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500"><X size={18} /></button>
            <form onSubmit={saveItem} className="space-y-4">
              {/* Month */}
              <div>
                <label className="block text-xs font-bold mb-1">Month</label>
                <select
                  className="w-full border p-2 rounded"
                  value={item.month}
                  onChange={e => {
                    const newMonth = e.target.value;
                    setItem(prev => {
                      const updated = { ...prev, month: newMonth };
                      if (newMonth) {
                        const mIdx = MONTHS.indexOf(newMonth);
                        const mStr = String(mIdx + 1).padStart(2, '0');
                        // Reset dates if they don't match the new month
                        if (prev.fromDate && !prev.fromDate.includes(`-${mStr}-`)) updated.fromDate = '';
                        if (prev.toDate && !prev.toDate.includes(`-${mStr}-`)) updated.toDate = '';
                      }
                      return updated;
                    });
                  }}
                >
                  <option value="">-- Select Month --</option>
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              {/* Year */}
              <div>
                <label className="block text-xs font-bold mb-1">Year</label>
                {customYear ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="flex-1 border p-2 rounded"
                      placeholder="e.g. 2045"
                      value={item.year}
                      onChange={e => {
                        const newYear = e.target.value;
                        setItem(prev => {
                          const updated = { ...prev, year: newYear };
                          if (prev.fromDate && !prev.fromDate.startsWith(newYear)) updated.fromDate = '';
                          if (prev.toDate && !prev.toDate.startsWith(newYear)) updated.toDate = '';
                          return updated;
                        });
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="text-xs text-blue-500 underline whitespace-nowrap"
                      onClick={() => { setCustomYear(false); setItem({ ...item, year: String(currentYear) }); }}
                    >â† List</button>
                  </div>
                ) : (
                  <select
                    className="w-full border p-2 rounded"
                    value={YEARS.includes(Number(item.year)) ? item.year : ''}
                    onChange={e => {
                      if (e.target.value === '__other__') {
                        setCustomYear(true);
                        setItem(prev => ({ ...prev, year: '' }));
                      } else {
                        const newYear = e.target.value;
                        setItem(prev => {
                          const updated = { ...prev, year: newYear };
                          if (prev.fromDate && !prev.fromDate.startsWith(newYear)) updated.fromDate = '';
                          if (prev.toDate && !prev.toDate.startsWith(newYear)) updated.toDate = '';
                          return updated;
                        });
                      }
                    }}
                  >
                    <option value="">-- Select Year --</option>
                    {YEARS.map(y => <option key={y} value={String(y)}>{y}</option>)}
                    <option value="__other__">Other (type any year)...</option>
                  </select>
                )}
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold mb-1">From Date</label>
                  <input
                    type="date"
                    className="w-full border p-2"
                    value={item.fromDate}
                    min={(() => {
                      if (!item.month || !item.year) return "";
                      const mIdx = MONTHS.indexOf(item.month);
                      if (mIdx === -1) return "";
                      return `${item.year}-${String(mIdx + 1).padStart(2, '0')}-01`;
                    })()}
                    max={(() => {
                      if (!item.month || !item.year) return "";
                      const mIdx = MONTHS.indexOf(item.month);
                      if (mIdx === -1) return "";
                      const lastDay = new Date(item.year, mIdx + 1, 0).getDate();
                      return `${item.year}-${String(mIdx + 1).padStart(2, '0')}-${lastDay}`;
                    })()}
                    onChange={e => setItem({ ...item, fromDate: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold mb-1">To Date</label>
                  <input
                    type="date"
                    className="w-full border p-2"
                    value={item.toDate}
                    min={(() => {
                      if (!item.month || !item.year) return "";
                      const mIdx = MONTHS.indexOf(item.month);
                      if (mIdx === -1) return "";
                      return `${item.year}-${String(mIdx + 1).padStart(2, '0')}-01`;
                    })()}
                    max={(() => {
                      if (!item.month || !item.year) return "";
                      const mIdx = MONTHS.indexOf(item.month);
                      if (mIdx === -1) return "";
                      const lastDay = new Date(item.year, mIdx + 1, 0).getDate();
                      return `${item.year}-${String(mIdx + 1).padStart(2, '0')}-${lastDay}`;
                    })()}
                    onChange={e => setItem({ ...item, toDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Max Seats</label>
                <input type="number" className="w-full border p-2" value={item.maxSeats} onChange={e => setItem({ ...item, maxSeats: parseInt(e.target.value) || '' })} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold mb-1">Availability Text</label>
                  <input type="text" className="w-full border p-2" value={item.availabilityText} onChange={e => setItem({ ...item, availabilityText: e.target.value })} />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold mb-1">Availability text Color</label>
                  <select className="w-full border p-2" value={item.availabilityTextColor} onChange={e => setItem({ ...item, availabilityTextColor: e.target.value })}>
                    <option value="Green">Green</option>
                    <option value="Red">Red</option>
                    <option value="Yellow">Yellow</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Visible</label>
                <select className="w-full border p-2" value={item.visible ? 'true' : 'false'} onChange={e => setItem({ ...item, visible: e.target.value === 'true' })}>
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </div>
              <button className="bg-primary-600 text-white px-6 py-2 rounded font-medium mt-2">
                {editingIdx !== null ? 'Update' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// STEP 3: Overview
// -------------------------------------------------------------
function Step3Overview({ formData, setFormData }) {
  return (
    <div>
      <h3 className="font-bold text-gray-800 mb-4">Overview</h3>
      <div className="bg-white border rounded-lg overflow-hidden">
        <textarea id="overviewContent" defaultValue={formData.overview}></textarea>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// STEP 4: Itinerary
// -------------------------------------------------------------
function Step4Itinerary({ formData, setFormData }) {
  const [item, setItem] = useState({ heading: '', subheading: '', content: '' });
  const [editingIdx, setEditingIdx] = useState(null);

  const saveItem = () => {
    if (!item.heading) return;
    if (editingIdx !== null) {
      const updated = [...formData.itineraries];
      updated[editingIdx] = item;
      setFormData(prev => ({ ...prev, itineraries: updated }));
      setEditingIdx(null);
    } else {
      setFormData(prev => ({ ...prev, itineraries: [...prev.itineraries, item] }));
    }
    setItem({ heading: '', subheading: '', content: '' });
    if (window.itineraryEditor) window.itineraryEditor.setData('');
  };

  const editItem = (idx) => {
    const it = formData.itineraries[idx];
    setItem({ ...it });
    setEditingIdx(idx);

    // Retry until editor is ready
    const trySetData = (attempts = 0) => {
      if (window.itineraryEditor && window.itineraryEditor.status === 'ready') {
        window.itineraryEditor.setData(it.content || '');
      } else if (attempts < 20) {
        setTimeout(() => trySetData(attempts + 1), 100);
      }
    };
    setTimeout(() => trySetData(), 50);
  };

  const cancelEdit = () => {
    setEditingIdx(null);
    setItem({ heading: '', subheading: '', content: '' });
    if (window.itineraryEditor) window.itineraryEditor.setData('');
  };

  const removeItem = (idx) => {
    if (editingIdx === idx) setEditingIdx(null);
    setFormData(prev => ({ ...prev, itineraries: prev.itineraries.filter((_, i) => i !== idx) }));
  };

  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData(prev => ({ ...prev, itineraryPdfBase64: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const handler = (e) => setItem(prev => ({ ...prev, content: e.detail }));
    window.addEventListener('itineraryContentChange', handler);
    return () => window.removeEventListener('itineraryContentChange', handler);
  }, []);



  return (
    <div>
      <h3 className="font-bold text-gray-800 mb-6 text-lg">Itinerary Planner</h3>

      <div className="flex items-center gap-4 mb-6">
        <label className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm cursor-pointer hover:bg-gray-200">
          Upload Itinerary PDF
          <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
        </label>
        {formData.itineraryPdf && !formData.itineraryPdfBase64 && (
          <a href={formData.itineraryPdf} target="_blank" rel="noreferrer" className="text-blue-500 text-sm hover:underline">
            View Current PDF
          </a>
        )}
        {formData.itineraryPdfBase64 && (
          <span className="text-green-600 text-sm italic">New PDF selected</span>
        )}
      </div>

      <div className={`space-y-4 mb-8 p-4 rounded-lg border ${editingIdx !== null ? 'border-blue-400 bg-blue-50' : 'border-transparent'}`}>
        {editingIdx !== null && <p className="text-xs font-semibold text-blue-600">Editing Itinerary Step #{editingIdx + 1}</p>}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold mb-2">Heading</label>
            <input type="text" className="w-full border p-2" placeholder="Enter heading" value={item.heading} onChange={e => setItem({ ...item, heading: e.target.value })} />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold mb-2">Subheading</label>
            <input type="text" className="w-full border p-2" placeholder="Enter subheading" value={item.subheading} onChange={e => setItem({ ...item, subheading: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold mb-2">Content</label>
          <div className="bg-white border rounded-lg overflow-hidden">
            <textarea id="itineraryContent" defaultValue={item.content}></textarea>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={saveItem} className="bg-primary-600 text-white px-6 py-2 rounded text-sm">
            {editingIdx !== null ? 'Update Step' : 'Save Itinerary Block'}
          </button>
          {editingIdx !== null && (
            <button onClick={cancelEdit} className="bg-gray-200 text-gray-700 px-6 py-2 rounded text-sm">Cancel</button>
          )}
        </div>
      </div>

      <hr />

      <div className="mt-8 space-y-4">
        <h4 className="font-semibold text-gray-600">Saved Itineraries ({formData.itineraries.length})</h4>
        {formData.itineraries.map((it, i) => (
          <div key={i} className="border p-4 bg-gray-50 rounded relative group">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
              <button type="button" onClick={() => editItem(i)} className="text-blue-500 bg-white p-1 rounded shadow hover:text-blue-700"><Edit size={16} /></button>
              <button type="button" onClick={() => removeItem(i)} className="text-red-500 bg-white p-1 rounded shadow hover:text-red-700"><Trash2 size={16} /></button>
            </div>
            <h5 className="font-bold">{it.heading} <span className="text-gray-400 font-normal">| {it.subheading}</span></h5>
            <div className="text-sm mt-2" dangerouslySetInnerHTML={{ __html: it.content }}></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// STEP 5: FAQ
// -------------------------------------------------------------
function Step5FAQ({ formData, setFormData }) {
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
    if (window.faqEditor) window.faqEditor.setData('');
  };

  const editItem = (idx) => {
    const faq = formData.faqs[idx];
    setItem({ ...faq });
    setEditingIdx(idx);
    const trySetData = (attempts) => {
      if (window.faqEditor && window.faqEditor.status === 'ready') {
        window.faqEditor.setData(faq.content || '');
      } else if (attempts < 20) {
        setTimeout(() => trySetData(attempts + 1), 100);
      }
    };
    setTimeout(() => trySetData(0), 50);
  };

  const cancelEdit = () => {
    setEditingIdx(null);
    setItem({ heading: '', content: '' });
    if (window.faqEditor) window.faqEditor.setData('');
  };

  const removeItem = (idx) => {
    if (editingIdx === idx) { setEditingIdx(null); setItem({ heading: '', content: '' }); }
    setFormData(prev => ({ ...prev, faqs: prev.faqs.filter((_, i) => i !== idx) }));
  };

  useEffect(() => {
    const handler = (e) => setItem(prev => ({ ...prev, content: e.detail }));
    window.addEventListener('faqContentChange', handler);
    return () => window.removeEventListener('faqContentChange', handler);
  }, []);

  return (
    <div>
      <h3 className="font-bold text-gray-800 mb-4 text-lg">FAQ Editor</h3>
      <div className={`space-y-4 mb-8 p-4 rounded-lg border ${editingIdx !== null ? 'border-blue-400 bg-blue-50' : 'border-transparent'}`}>
        {editingIdx !== null && <p className="text-xs font-semibold text-blue-600">Editing FAQ #{editingIdx + 1}</p>}
        <div className="flex-1">
          <label className="block text-xs font-bold mb-2">Question</label>
          <input type="text" className="w-full border p-2 mb-2" placeholder="Enter question" value={item.heading} onChange={e => setItem({ ...item, heading: e.target.value })} />
        </div>
        <div className="pb-4">
          <label className="block text-xs font-bold mb-2">Answer</label>
          <div className="bg-white border rounded-lg overflow-hidden">
            <textarea id="faqContent" defaultValue={item.content}></textarea>
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
            <div className="text-gray-600 mt-1" dangerouslySetInnerHTML={{ __html: f.content }} />
            <div className="absolute top-[50%] -translate-y-1/2 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
              <button type="button" onClick={() => editItem(i)} className="text-blue-500 bg-gray-100 p-1 rounded hover:text-blue-700"><Edit size={16} /></button>
              <button type="button" onClick={() => removeItem(i)} className="text-red-500 bg-gray-100 p-1 rounded hover:text-red-700"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// STEP 6: Tab
// -------------------------------------------------------------
function Step6Tab({ formData, setFormData }) {
  const [newTab, setNewTab] = useState('');

  const addTab = () => {
    if (newTab.trim()) {
      setFormData(prev => ({ ...prev, tabs: [...(prev.tabs || []), newTab.trim()] }));
      setNewTab('');
    }
  };

  const removeTab = (idx) => {
    setFormData(prev => ({ ...prev, tabs: (prev.tabs || []).filter((_, i) => i !== idx) }));
  };

  return (
    <div>
      <h3 className="font-bold text-gray-800 mb-6 text-lg">Tab Settings</h3>
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Tab Name</label>
          <input
            type="text"
            value={newTab}
            onChange={(e) => setNewTab(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTab()}
            placeholder="Enter tab name"
            className="w-full border border-gray-200 rounded p-2 focus:border-green-400 outline-none"
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={addTab}
            className="px-6 py-2 bg-primary-600 text-white rounded font-medium hover:bg-primary-700 transition"
          >
            Add Tab
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Added Tabs</label>
        {(!formData.tabs || formData.tabs.length === 0) ? (
          <p className="text-gray-400 italic text-sm">No tabs added yet. These will appear in the Gallery dropdown.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {formData.tabs.map((tab, i) => (
              <div key={i} className="flex items-center bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg group hover:border-red-200 hover:bg-red-50 transition-colors">
                <span className="text-sm font-medium text-gray-700 group-hover:text-red-700">{tab}</span>
                <button
                  type="button"
                  onClick={() => removeTab(i)}
                  className="ml-2 text-gray-400 hover:text-red-600 transition"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// STEP 7: Gallery
// -------------------------------------------------------------
function Step7Gallery({ formData, setFormData }) {
  const [selectedTab, setSelectedTab] = useState('');

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData(prev => ({
          ...prev,
          gallery: [...(prev.gallery || []), { url: ev.target.result, tab: selectedTab }]
        }));
      };
      reader.readAsDataURL(file);
    });
    // Reset value so same file can be picked again
    e.target.value = '';
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData(prev => ({
        ...prev,
        thumbnailBase64: ev.target.result,
        thumbnail: ''
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeImage = (idx) => {
    setFormData(prev => ({
      ...prev,
      gallery: (prev.gallery || []).filter((_, i) => i !== idx)
    }));
  };

  return (
    <div>
      {/* Thumbnail Upload Section */}
      <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-xl">
        <h4 className="font-bold text-gray-800 text-sm mb-1">Package Cover / Thumbnail Image</h4>
        <p className="text-xs text-gray-500 mb-4">This image will be displayed on package cards and listings. Upload a new image or set one from the gallery below.</p>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-40 h-28 bg-white border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center shadow-sm">
            {(formData.thumbnail || formData.thumbnailBase64) ? (
              <>
                <img
                  src={formData.thumbnailBase64 || formData.thumbnail}
                  alt="Thumbnail Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, thumbnail: '', thumbnailBase64: '' }))}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 transition"
                >
                  <X size={12} />
                </button>
              </>
            ) : (
              <span className="text-gray-400 text-xs text-center p-2">No Thumbnail</span>
            )}
          </div>

          <label className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded font-medium cursor-pointer hover:bg-gray-50 transition text-sm">
            Upload Thumbnail
            <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
          </label>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="font-bold text-gray-800 text-lg">Media Gallery</h3>
          <p className="text-sm text-gray-500">Choose a tab then add images to categorize them.</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <select
            value={selectedTab}
            onChange={(e) => setSelectedTab(e.target.value)}
            className="flex-1 md:w-48 border border-primary-600 rounded p-2 text-sm focus:border-primary-600 outline-none bg-white"
          >
            <option value=""> Select Tab</option>
            {formData.tabs?.map((tab, i) => (
              <option key={i} value={tab}>{tab}</option>
            ))}
          </select>

          <label className="bg-primary-600 text-white px-4 py-2 rounded font-medium cursor-pointer hover:bg-primary-700 transition flex items-center gap-2 whitespace-nowrap">
            + Add Media Item
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
          </label>
        </div>
      </div>

      {(!formData.gallery || formData.gallery.length === 0) ? (
        <p className="text-gray-400 text-center py-10 border rounded bg-gray-50">No media items added yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {formData.gallery.map((item, i) => {
            const itemUrl = typeof item === 'string' ? item : item.url;
            const isCurrentThumbnail = itemUrl === (formData.thumbnail || formData.thumbnailBase64);

            return (
              <div key={i} className="relative group border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition">
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={itemUrl}
                    alt="Gallery item"
                    className="w-full h-full object-cover"
                  />

                  {isCurrentThumbnail && (
                    <div className="absolute top-2 left-2 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded font-bold backdrop-blur-sm z-10">
                      Cover Image
                    </div>
                  )}

                  {item.tab && !isCurrentThumbnail && (
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-medium backdrop-blur-sm">
                      {item.tab}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 bg-red-600/90 text-white rounded-full p-1.5 shadow-md hover:bg-red-700 transition opacity-0 group-hover:opacity-100 z-10"
                  >
                    <X size={14} />
                  </button>

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-end justify-center p-2 z-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (itemUrl.startsWith('data:image/')) {
                          setFormData(prev => ({ ...prev, thumbnailBase64: itemUrl, thumbnail: '' }));
                        } else {
                          setFormData(prev => ({ ...prev, thumbnail: itemUrl, thumbnailBase64: '' }));
                        }
                        toast.success('Selected as package thumbnail');
                      }}
                      className="w-full bg-primary-600/90 text-white text-xs py-1.5 rounded font-medium hover:bg-primary-700 transition"
                    >
                      Set as Thumbnail
                    </button>
                  </div>
                </div>

                {typeof item !== 'string' && (
                  <div className="p-2 border-t border-gray-50">
                    <select
                      value={item.tab || ''}
                      onChange={(e) => {
                        const newGallery = [...formData.gallery];
                        newGallery[i] = { ...item, tab: e.target.value };
                        setFormData({ ...formData, gallery: newGallery });
                      }}
                      className="w-full text-[11px] text-gray-500 bg-transparent outline-none cursor-pointer hover:text-primary-600"
                    >
                      <option value="">No Tab</option>
                      {formData.tabs?.map((tab, idx) => (
                        <option key={idx} value={tab}>{tab}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// STEP 8: SEO
// -------------------------------------------------------------
function Step8SEO({ formData, setFormData }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      seo: { ...prev.seo, [name]: value }
    }));
  };

  return (
    <div>
      <h3 className="font-bold text-gray-800 mb-6 text-lg">SEO Settings</h3>
      <div className="space-y-6">
        <div className="flex gap-6">
          <div className="flex-1">
            <label className="block text-xs font-bold mb-2">Meta Title *</label>
            <input type="text" name="title" className="w-full border p-2 rounded" placeholder="Enter meta title" value={formData.seo?.title || ''} onChange={handleChange} />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold mb-2">Meta Description *</label>
            <input type="text" name="description" className="w-full border p-2 rounded" placeholder="Enter meta description" value={formData.seo?.description || ''} onChange={handleChange} />
          </div>
        </div>
        <div className="flex gap-6">
          <div className="flex-1">
            <label className="block text-xs font-bold mb-2">Meta Keywords *</label>
            <input type="text" name="keywords" className="w-full border p-2 rounded" placeholder="Enter meta keywords" value={formData.seo?.keywords || ''} onChange={handleChange} />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold mb-2">Canonical</label>
            <input type="text" name="canonical" className="w-full border p-2 rounded" placeholder="Enter canonical" value={formData.seo?.canonical || ''} onChange={handleChange} />
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// STEP 9: Other Options
// -------------------------------------------------------------
function Step9OtherOptions({ formData, setFormData }) {
  const [item, setItem] = useState({ name: '', content: '' });
  const [editingIdx, setEditingIdx] = useState(null);

  const saveItem = () => {
    if (!item.name) return;
    if (editingIdx !== null) {
      const updated = [...(formData.otherOptions || [])];
      updated[editingIdx] = item;
      setFormData(prev => ({ ...prev, otherOptions: updated }));
      setEditingIdx(null);
    } else {
      setFormData(prev => ({ ...prev, otherOptions: [...(prev.otherOptions || []), item] }));
    }
    setItem({ name: '', content: '' });
    if (window.otherOptionEditor) window.otherOptionEditor.setData('');
  };

  const editItem = (idx) => {
    const opt = formData.otherOptions[idx];
    setItem({ ...opt });
    setEditingIdx(idx);

    // Retry until editor is ready
    const trySetData = (attempts = 0) => {
      if (window.otherOptionEditor && window.otherOptionEditor.status === 'ready') {
        window.otherOptionEditor.setData(opt.content || '');
      } else if (attempts < 20) {
        setTimeout(() => trySetData(attempts + 1), 100);
      }
    };
    setTimeout(() => trySetData(), 50);
  };

  const cancelEdit = () => {
    setEditingIdx(null);
    setItem({ name: '', content: '' });
    if (window.otherOptionEditor) window.otherOptionEditor.setData('');
  };

  const removeItem = (idx) => {
    if (editingIdx === idx) setEditingIdx(null);
    setFormData(prev => ({ ...prev, otherOptions: prev.otherOptions.filter((_, i) => i !== idx) }));
  };

  useEffect(() => {
    const handler = (e) => setItem(prev => ({ ...prev, content: e.detail }));
    window.addEventListener('otherOptionContentChange', handler);
    return () => window.removeEventListener('otherOptionContentChange', handler);
  }, []);



  return (
    <div>
      <h3 className="font-bold text-gray-800 mb-6 text-lg">Other Options</h3>
      <div className="space-y-4 mb-8">
        <div className="flex-1">
          <label className="block text-xs font-bold mb-2">Other Option Name</label>
          <input type="text" className="w-full border p-2 rounded" placeholder="Enter other option name" value={item.name} onChange={e => setItem({ ...item, name: e.target.value })} />
        </div>
        <div className="pb-4">
          <label className="block text-xs font-bold mb-2">Content To Add</label>
          <div className="bg-white border rounded-lg overflow-hidden">
            <textarea id="otherOptionContent" defaultValue={item.content}></textarea>
          </div>
        </div>
        <button onClick={saveItem} className="bg-primary-600 text-white px-6 py-2 rounded text-sm mt-2">Submit Option</button>
      </div>

      <div className="mt-8 space-y-4">
        <h4 className="font-semibold text-gray-600">Saved Options ({formData.otherOptions?.length || 0})</h4>
        {formData.otherOptions?.map((opt, i) => (
          <div key={i} className="border p-4 bg-gray-50 rounded relative group">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
              <button type="button" onClick={() => editItem(i)} className="text-blue-500 bg-white p-1 rounded shadow hover:text-blue-700"><Edit size={16} /></button>
              <button type="button" onClick={() => removeItem(i)} className="text-red-500 bg-white p-1 rounded shadow hover:text-red-700"><Trash2 size={16} /></button>
            </div>
            <h5 className="font-bold mb-2">{opt.name}</h5>
            <div dangerouslySetInnerHTML={{ __html: opt.content }}></div>
          </div>
        ))}
      </div>
    </div>
  );
}

