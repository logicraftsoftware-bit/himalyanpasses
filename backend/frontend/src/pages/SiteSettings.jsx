import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Save, Plus, SettingsIcon, Trash2, Edit, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE, apiPutForm, apiDelete } from '../utils/api';

export default function SiteSettings() {
  const [form, setForm] = useState({
    contactNumber: '',
    whatsappNumber: '',
    emailId: '',
    address: '',
    mapIframe: '',
  });
  const [socialLinks, setSocialLinks] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  
  const [settingData, setSettingData] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/settings`);
      const data = await res.json();
      if (
        data &&
        data._id &&
        (data.contactNumber ||
          data.whatsappNumber ||
          data.emailId ||
          data.address ||
          data.logoUrl ||
          data.socialLinks?.length > 0)
      ) {
        setSettingData(data);
        populateForm(data);
      } else {
        setSettingData(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (data) => {
    setForm({
      contactNumber: data.contactNumber || '',
      whatsappNumber: data.whatsappNumber || '',
      emailId: data.emailId || '',
      address: data.address || '',
      mapIframe: data.mapIframe || '',
    });
    setSocialLinks(data.socialLinks || []);
    if (data.logoUrl) {
      setLogoPreview(data.logoUrl);
    } else {
      setLogoPreview('');
    }
    setLogoFile(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSocialChange = (index, field, value) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: '', url: '', iconUrl: '', iconPublicId: '', iconFile: null }]);
  };

  const removeSocialLink = (index) => {
    const updated = [...socialLinks];
    updated.splice(index, 1);
    setSocialLinks(updated);
  };

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('contactNumber', form.contactNumber);
      formData.append('whatsappNumber', form.whatsappNumber);
      formData.append('emailId', form.emailId);
      formData.append('address', form.address);
      formData.append('mapIframe', form.mapIframe);

      const socialLinksDataForJson = socialLinks.map(link => ({
        platform: link.platform,
        url: link.url,
        iconUrl: link.iconUrl,
        iconPublicId: link.iconPublicId
      }));
      formData.append('socialLinks', JSON.stringify(socialLinksDataForJson));
      
      socialLinks.forEach((link, index) => {
        if (link.iconFile) {
          formData.append(`socialIcon_${index}`, link.iconFile);
        }
      });
      
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      await apiPutForm('/api/settings', formData);

      toast.success('Site settings saved successfully!');
      setIsFormOpen(false);
      fetchSettings();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to completely clear the site settings?')) return;
    
    setLoading(true);
    try {
      await apiDelete('/api/settings');
      toast.success('Settings cleared');
      setSettingData(null);
      populateForm({});
      setIsFormOpen(false);
      fetchSettings();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (settingData) populateForm(settingData);
    setIsFormOpen(true);
  };

  return (
    <div className="p-6 space-y-6  mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Site Settings</h1>
        {!isFormOpen && (
          <button 
            onClick={handleEditClick}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            <Plus size={18} /> {settingData ? 'Edit Settings' : 'Add Settings'}
          </button>
        )}
      </div>
      
      {isFormOpen && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b">
            <h2 className="text-lg font-semibold text-gray-800">{settingData ? 'Edit' : 'Add'} Site Settings</h2>
            <button onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Contact Number</label>
                <input
                  name="contactNumber"
                  placeholder="+1 234 567 890"
                  value={form.contactNumber}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">WhatsApp Number</label>
                <input
                  name="whatsappNumber"
                  placeholder="+1 234 567 890"
                  value={form.whatsappNumber}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <input
                  name="emailId"
                  type="email"
                  placeholder="contact@glacier.com"
                  value={form.emailId}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Physical Address</label>
                <textarea
                  name="address"
                  placeholder="123 Main Street, City, Country"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-24"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Map Iframe HTML</label>
                <textarea
                  name="mapIframe"
                  placeholder='<iframe src="..." ></iframe>'
                  value={form.mapIframe}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-24 font-mono text-sm"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-md font-semibold mb-4">Brand Logo</h3>
              <div className="flex items-start gap-6">
                <div className="flex-1 space-y-2">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoChange}
                    className="w-full p-3 border rounded-lg border-dashed"
                  />
                </div>
                
                <div className="h-24 w-24 border-2 border-dashed rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center">
                      <ImageIcon size={20} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-semibold">Social Media Links</h3>
                <button 
                  type="button" 
                  onClick={addSocialLink}
                  className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md hover:bg-blue-100"
                >
                  <Plus size={16} /> Add Link
                </button>
              </div>
              
              <div className="space-y-3">
                {socialLinks.map((link, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-2 items-start md:items-center">
                    <input
                      type="text"
                      placeholder="Platform"
                      value={link.platform}
                      onChange={(e) => handleSocialChange(index, 'platform', e.target.value)}
                      className="flex-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="URL"
                      value={link.url}
                      onChange={(e) => handleSocialChange(index, 'url', e.target.value)}
                      className="flex-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    
                    <div className="flex-1 w-full flex items-center gap-2">
                      {(link.iconUrl || link.iconFile) && (
                        <div className="h-10 w-10 flex-shrink-0 bg-white border rounded overflow-hidden flex items-center justify-center">
                          <img 
                            src={link.iconFile ? URL.createObjectURL(link.iconFile) : link.iconUrl} 
                            alt="Social Icon" 
                            className="h-6 w-6 object-contain"
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleSocialChange(index, 'iconFile', e.target.files[0]);
                          }
                        }}
                        className="w-full text-sm border rounded p-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    
                    <button  
                      type="button" 
                      onClick={() => removeSocialLink(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded self-end md:self-auto"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-6 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-primary-600 text-white px-8 py-2 rounded-lg hover:bg-primary-700 font-medium disabled:opacity-70"
              >
                <Save size={18} />
                {loading ? 'Saving...' : 'Save Data'}
              </button>
            </div>
          </form>
        </div>
      )}

      {!isFormOpen && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : !settingData ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <SettingsIcon size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No site settings data found.</p>
              <p className="text-gray-400 text-sm mt-1 mb-6">Click the Add button to set up your site's identity.</p>
              <button 
                onClick={handleEditClick}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                Set up now
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left">
                <thead className="bg-gray-50 border-b text-sm text-gray-600 font-medium">
                  <tr>
                    <th className="px-6 py-4">Logo</th>
                    <th className="px-6 py-4">Contact Info</th>
                    <th className="px-6 py-4 border-l">Social Medias</th>
                    <th className="px-6 py-4 text-center border-l w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 align-top">
                  <tr>
                    <td className="px-6 py-4">
                      {settingData.logoUrl ? (
                        <img src={settingData.logoUrl} alt="Logo" className="w-16 h-16 object-contain bg-gray-50 rounded" />
                      ) : (
                        <span className="text-gray-400 italic text-sm">No logo</span>
                      )}
                    </td>
                    <td className="px-6 py-4 space-y-2">
                      <p className="font-medium text-gray-900"><span className='font-semibold text-sm'>Contact No.- </span>
                        {settingData.contactNumber || <span className="text-gray-400 italic font-normal">No number</span>}
                      </p>
                      <p className="text-gray-600"> <span className='font-semibold text-sm'>WhatsApp No.- </span>
                        {settingData.whatsappNumber || <span className="text-gray-400 italic font-normal">No WhatsApp number</span>}
                      </p>
                      <p className="text-gray-600"><span className='font-semibold text-sm'>Email ID - </span>
                        {settingData.emailId || <span className="text-gray-400 italic font-normal" >No email</span>}
                      </p>
                      <p className="text-gray-500 text-sm mt-2 max-w-xs"><span className='font-semibold text-sm'>Address - </span>
                        {settingData.address || <span className="text-gray-400 italic font-normal">No address</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4 border-l">
                      {settingData.socialLinks && settingData.socialLinks.length > 0 ? (
                        <ul className="space-y-1">
                          {settingData.socialLinks.map((s, i) => (
                            <li key={i} className="text-sm">
                              <span className="font-medium text-gray-700 flex items-center gap-2">
                                {s.iconUrl && <img src={s.iconUrl} alt="icon" className="w-4 h-4 object-contain inline-block" />}
                                {s.platform || 'Link'}:
                              </span>{' '}
                              <a href={s.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                {s.url}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400 italic text-sm">No social links</span>
                      )}
                    </td>
                    <td className="px-6 py-4 border-l">
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={handleEditClick}
                          className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded border border-blue-100 hover:bg-blue-100 transition"
                        >
                          <Edit size={14} /> Edit
                        </button>
                        <button 
                          onClick={handleDelete}
                          className="flex items-center justify-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded border border-red-100 hover:bg-red-100 transition"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              {settingData.mapIframe && (
                <div className="px-6 py-4 border-t bg-gray-50">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Map Widget Preview</h4>
                  <div
                    className="h-48 w-full rounded overflow-hidden shadow-sm border border-gray-200"
                    dangerouslySetInnerHTML={{ __html: settingData.mapIframe }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

