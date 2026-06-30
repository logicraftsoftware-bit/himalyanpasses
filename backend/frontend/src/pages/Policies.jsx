import { useEffect, useMemo, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'quill/dist/quill.snow.css';
import { Save, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE, apiPut } from '../utils/api';

const policyOptions = [
  { key: 'terms', label: 'Terms & Conditions' },
  { key: 'privacy', label: 'Privacy Policy' },
  { key: 'refund', label: 'Refund Policy' }
];

export default function Policies() {
  const { user } = useAuth();

  const [selectedType, setSelectedType] = useState('terms');
  const [form, setForm] = useState({
    title: '',
    content: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    let editorInstance = null;
    const script = document.createElement('script');
    script.src = "https://cdn.ckeditor.com/4.22.1/full/ckeditor.js";
    script.async = true;
    script.onload = () => {
      if (window.CKEDITOR) {
        if (window.CKEDITOR.instances.policyContent) {
          window.CKEDITOR.instances.policyContent.destroy(true);
        }
        editorInstance = window.CKEDITOR.replace('policyContent', {
          height: 400,
          versionCheck: false,
        });
        editorInstance.on('instanceReady', () => {
          editorInstance.setData(form.content);
        });
        editorInstance.on('change', () => {
          setForm(prev => ({ ...prev, content: editorInstance.getData() }));
        });
      }
    };
    document.body.appendChild(script);
    
    return () => {
      if (window.CKEDITOR && window.CKEDITOR.instances.policyContent) {
        window.CKEDITOR.instances.policyContent.destroy(true);
      }
    };
  }, [selectedType, fetching]);

  const currentLabel = useMemo(() => {
    return policyOptions.find((p) => p.key === selectedType)?.label || 'Policy';
  }, [selectedType]);

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
    fetchPolicy(selectedType);
  }, [selectedType]);

  const fetchPolicy = async (type) => {
    setFetching(true);
    try {
      const res = await fetch(`${API_BASE}/api/policies/${type}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to load ${type} policy`);
      }

      setForm({
        title: data.title || '',
        content: data.content || '',
        isActive: data.isActive ?? true
      });
    } catch (err) {
      toast.error(err.message || 'Failed to fetch policy');
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiPut(`/api/policies/${selectedType}`, form);
      setForm({
        title: data.title || '',
        content: data.content || '',
        isActive: data.isActive ?? true
      });
      toast.success(`${currentLabel} saved successfully`);
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6  mx-auto space-y-6">
      <div className="flex items-center gap-3">
        
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Policy Management</h1>
          <p className="text-sm text-gray-500">Manage Terms, Privacy and Refund content</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        <div className="border-b bg-gray-50 px-4 py-3 flex flex-wrap gap-2">
          {policyOptions.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setSelectedType(item.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedType === item.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border hover:bg-gray-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder={`Enter ${currentLabel}`}
                className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Content</label>
              <div className="rounded-lg overflow-hidden border bg-white">
                <textarea id="policyContent" defaultValue={form.content}></textarea>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || fetching}
              className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 disabled:opacity-60"
            >
              <Save size={18} />
              {loading ? 'Saving...' : fetching ? 'Loading...' : 'Save Policy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

