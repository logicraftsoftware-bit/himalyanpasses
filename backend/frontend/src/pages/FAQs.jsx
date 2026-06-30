import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, Edit } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../components/ui/Table";
import { API_BASE, apiPost, apiPut, apiDelete } from '../utils/api';

export default function FAQs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    question: '',
    answer: '',
    isActive: true,
  });

  const [editingId, setEditingId] = useState(null);
  const { user } = useAuth();

  // Load CKEditor when form is shown
  useEffect(() => {
    let editorInstance = null;
    const script = document.createElement('script');
    script.src = "https://cdn.ckeditor.com/4.22.1/full/ckeditor.js";
    script.async = true;
    script.onload = () => {
      if (window.CKEDITOR) {
        if (window.CKEDITOR.instances.faqAnswer) {
          window.CKEDITOR.instances.faqAnswer.destroy(true);
        }
        editorInstance = window.CKEDITOR.replace('faqAnswer', {
          height: 200,
          versionCheck: false,
        });
        editorInstance.on('instanceReady', () => {
          editorInstance.setData(form.answer);
        });
        editorInstance.on('change', () => {
          setForm(prev => ({ ...prev, answer: editorInstance.getData() }));
        });
      }
    };
    // If CKEditor is already loaded, init directly
    if (window.CKEDITOR) {
      if (window.CKEDITOR.instances.faqAnswer) {
        window.CKEDITOR.instances.faqAnswer.destroy(true);
      }
      editorInstance = window.CKEDITOR.replace('faqAnswer', {
        height: 200,
        versionCheck: false,
      });
      editorInstance.on('instanceReady', () => {
        editorInstance.setData(form.answer);
      });
      editorInstance.on('change', () => {
        setForm(prev => ({ ...prev, answer: editorInstance.getData() }));
      });
    } else {
      document.body.appendChild(script);
    }

    return () => {
      if (window.CKEDITOR && window.CKEDITOR.instances.faqAnswer) {
        window.CKEDITOR.instances.faqAnswer.destroy(true);
      }
    };
  }, []); // init once on mount

  // (editor data is set directly in startEdit/cancelEdit to avoid stale-state timing issues)

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/faqs`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setFaqs(data);
      } else {
        setFaqs([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Get latest content from CKEditor
    const answer = window.CKEDITOR && window.CKEDITOR.instances.faqAnswer
      ? window.CKEDITOR.instances.faqAnswer.getData()
      : form.answer;
    const payload = { ...form, answer };

    try {
      if (editingId) {
        await apiPut(`/api/faqs/${editingId}`, payload);
      } else {
        await apiPost('/api/faqs', payload);
      }

      const resetForm = { question: '', answer: '', isActive: true };
      setForm(resetForm);
      if (window.CKEDITOR && window.CKEDITOR.instances.faqAnswer) {
        window.CKEDITOR.instances.faqAnswer.setData('');
      }
      toast.success(editingId ? 'FAQ updated successfully' : 'FAQ added successfully');
      setEditingId(null);
      fetchFaqs();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteFaq = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      await apiDelete(`/api/faqs/${id}`);
      toast.success('FAQ deleted successfully');
      fetchFaqs();
    } catch {
      toast.error('Failed to delete FAQ');
    }
  };

  const startEdit = (t) => {
    setEditingId(t._id);
    setForm({
      question: t.question,
      answer: t.answer,
      isActive: t.isActive,
    });
    // Set editor content immediately with the actual value (not via state which is async)
    if (window.CKEDITOR && window.CKEDITOR.instances.faqAnswer) {
      window.CKEDITOR.instances.faqAnswer.setData(t.answer || '');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ question: '', answer: '', isActive: true });
    if (window.CKEDITOR && window.CKEDITOR.instances.faqAnswer) {
      window.CKEDITOR.instances.faqAnswer.setData('');
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          {editingId ? <Edit size={18} /> : <Plus size={18} />} {editingId ? 'Edit' : 'Add'} FAQ
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="question"
            required
            placeholder="Question (e.g., Why choose us?)"
            value={form.question}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
            <div className="bg-white border rounded-lg overflow-hidden">
              <textarea id="faqAnswer" name="faqAnswer" defaultValue={form.answer}></textarea>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="w-4 h-4"
            />
            Active (Visible on website)
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              {editingId ? 'Update' : 'Save'} FAQ
            </button>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-100 text-gray-700 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>

        {loading ? (
          <p>Loading...</p>
        ) : faqs.length === 0 ? (
          <p className="text-gray-500">No FAQs found. Create one above.</p>
        ) : (
          <Table className="border">
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Answer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {faqs.map((f) => (
                <TableRow key={f._id}>
                  <TableCell>
                    <p className="font-medium text-gray-900">{f.question}</p>
                  </TableCell>

                  <TableCell>
                    <div
                      className="text-gray-600 text-sm line-clamp-2 prose prose-sm max-w-xs"
                      dangerouslySetInnerHTML={{ __html: f.answer }}
                      title={f.answer?.replace(/<[^>]*>/g, '')}
                    />
                  </TableCell>

                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${f.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {f.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => startEdit(f)}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => deleteFaq(f._id)}
                        className="bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

