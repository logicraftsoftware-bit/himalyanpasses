import React, { useState } from 'react';
import { Phone, Mail, MessageSquare, MapPin, Send, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:4000' : '');

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Message sent successfully!');
        setFormData({ name: '', email: '', phoneNumber: '', message: '' });
      } else {
        toast.error(data.message || 'Failed to send message');
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header / Navbar Placeholder (Matches screenshot) */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold">GT</div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 leading-none">Glacier Treks</h1>
              <p className="text-[10px] text-teal-600 font-semibold tracking-widest uppercase">& Adventureâ„¢ | Since 2010</p>
            </div>
          </div>
          <button className="bg-[#10B981] text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 shadow-sm hover:bg-[#059669] transition">
            <MessageSquare size={18} />
            Quick Enquiry
          </button>
        </div>
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#" className="flex items-center gap-1 hover:text-teal-600 transition"><span>ðŸ </span> Home</a>
          <a href="#" className="flex items-center gap-1 hover:text-teal-600 transition"><span>ðŸ”ï¸</span> Upcoming Trek</a>
          <a href="#" className="flex items-center gap-1 hover:text-teal-600 transition"><span>ðŸš¶</span> Trekking</a>
          <a href="#" className="flex items-center gap-1 hover:text-teal-600 transition"><span>ðŸ—ºï¸</span> Tours</a>
          <a href="#" className="flex items-center gap-1 hover:text-teal-600 transition"><span>ðŸš©</span> Expedition</a>
          <a href="#" className="flex items-center gap-1 hover:text-teal-600 transition">About</a>
          <a href="#" className="flex items-center gap-1 text-teal-600 border-b-2 border-teal-600 h-full flex items-center">Contact Us</a>
          <a href="#" className="flex items-center gap-1 hover:text-teal-600 transition">Articles</a>
          <a href="#" className="ml-auto flex items-center gap-1 hover:text-teal-600 transition">Sign In</a>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column: Form */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tight">Get In Touch</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-gray-900 mb-2 uppercase tracking-wider">Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
                      <Send size={16} />
                    </span>
                    <input 
                      required
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name" 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-900 mb-2 uppercase tracking-wider">Phone Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
                      <Phone size={16} />
                    </span>
                    <input 
                      required
                      type="tel" 
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="Enter your contact number" 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
                    <Mail size={16} />
                  </span>
                  <input 
                    required
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 uppercase tracking-wider">Message</label>
                <textarea 
                  required
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Enter your message" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-4 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="bg-black text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Right Column: Info */}
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100">
              <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tight">Contact Information</h2>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900 uppercase tracking-widest mb-1">Phone</p>
                    <p className="text-lg font-bold text-gray-800 tracking-tight">+91 7407248200</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900 uppercase tracking-widest mb-1">Email</p>
                    <p className="text-lg font-bold text-gray-800 tracking-tight">kiran.yuksom@gmail.com</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900 uppercase tracking-widest mb-1">WhatsApp</p>
                    <p className="text-lg font-bold text-gray-800 tracking-tight">+91 7407248200</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900 uppercase tracking-widest mb-1">Address</p>
                    <p className="text-base font-bold text-gray-800 leading-relaxed tracking-tight">
                      Yuksom Bazar Main Road Near Hotel Yangri Gang, West Sikkim, Pin no - 737113
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Banner */}
            <div className="bg-[#f8f9fa] rounded-3xl p-8 border border-gray-100 flex items-center justify-between group cursor-pointer hover:bg-white transition-colors shadow-sm">
              <div>
                <h3 className="text-lg font-black text-gray-900 mb-1 tracking-tight">Make Life Count: Embrace the Adventure</h3>
                <p className="text-sm text-gray-500 font-medium tracking-tight">Life's short â€” explore, trek, and chase adventure.</p>
              </div>
              <button className="bg-black text-white px-6 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 group-hover:bg-teal-600 transition">
                Explore
                <span className="text-lg">â†’</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

