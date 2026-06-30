import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit2, X, Plus, Clock, Mountain } from 'lucide-react';

const CATEGORIES = ["Trending Trekking", "Upcoming"];

export default function MoreTreks() {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [promotedPackages, setPromotedPackages] = useState([]);
  const [allPackages, setAllPackages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Pagination for modal
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadData = async () => {
    setLoading(true);
    try {
      const [promotedRes, pkgs] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:4000' : '')}/api/more-treks?type=${encodeURIComponent(selectedCategory)}`).then(res => res.json()),
        apiGet('/api/packages')
      ]);

      setAllPackages(pkgs.data || []);
      if (promotedRes.success && promotedRes.data.length > 0) {
        const pkgsPopulated = promotedRes.data[0].packages;
        setPromotedPackages(pkgsPopulated);
        setSelectedIds(pkgsPopulated.map(p => p._id));
      } else {
        setPromotedPackages([]);
        setSelectedIds([]);
      }
    } catch (err) {
      toast.error('Failed to load treks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setCurrentPage(1);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCheckboxChange = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const saveSelections = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:4000' : '')}/api/more-treks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedCategory, packages: selectedIds })
      });
      const data = await res.json();
      if (!data.success) throw new Error();
      
      toast.success('Packages updated successfully');
      setIsModalOpen(false);
      loadData();
    } catch {
      toast.error('Failed to update packages');
    }
  };

  const removePackage = async (id) => {
    try {
      const newIds = selectedIds.filter(pid => pid !== id);
      const res = await fetch(`${import.meta.env.VITE_API_BASE || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:4000' : '')}/api/more-treks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedCategory, packages: newIds })
      });
      const data = await res.json();
      if (!data.success) throw new Error();
      
      toast.success('Package removed successfully');
      loadData();
    } catch {
      toast.error('Failed to remove package');
    }
  };

  const paginatedAllPkgs = allPackages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(allPackages.length / itemsPerPage);

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
       <div className="mb-6 flex items-center justify-between">
         <h1 className="text-2xl font-bold">More Packages</h1>
         <div className="flex items-center gap-4">
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="px-8 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-primary-500 shadow-sm"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button
              onClick={handleOpenModal}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg shadow-sm transition"
            >
              <Plus size={18} /> Choose Packages
            </button>
         </div>
       </div>
       
       {loading ? (
         <div className="text-center py-10">Loading...</div>
       ) : promotedPackages.length === 0 ? (
         <div className="text-center py-10 text-gray-500">No packages in this category. Click "Choose Packages" to add some.</div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {promotedPackages.map(pkg => (
             <div key={pkg._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300">
               <div className="h-48 w-full bg-gray-200">
                  {/* using first day image or some default, as package schema varies */}
                 {pkg.thumbnail ? (
                    <img src={pkg.thumbnail} alt={pkg.packageName} className="w-full h-full object-cover" />
                 ) : pkg.gallery && pkg.gallery.length > 0 ? (
                    <img src={pkg.gallery[0].url || pkg.gallery[0]} alt={pkg.packageName} className="w-full h-full object-cover" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                 )}
               </div>
               <div className="p-5 flex-1 flex flex-col">
                 <h3 className="font-bold text-lg mb-2 text-gray-900">{pkg.packageName}</h3>
                 <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                   {(pkg.shortDescription || (pkg.overview ? pkg.overview.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'") : '') || 'Amazing package features.')}
                 </p>
                 
                 <div className="flex flex-wrap gap-2 mb-4">
                   <span className="flex items-center gap-1 bg-[#e6f9f0] text-[#00c95a] text-xs font-semibold px-2.5 py-1 rounded-full">
                     <Clock size={12} /> {pkg.duration || 'N/A'}
                   </span>
                   {pkg.highestAltitude && (
                      <span className="flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                        <Mountain size={12} /> {pkg.highestAltitude}
                      </span>
                   )}
                 </div>

                 <div className="mt-auto flex justify-between gap-3 border-t border-gray-100 pt-4">
                   <button
                     onClick={() => removePackage(pkg._id)}
                     className="flex-1 flex items-center justify-center gap-1 bg-[#ff0000] hover:bg-red-700 text-white py-1.5 rounded-lg text-sm font-medium transition"
                   >
                     <Trash2 size={16} /> Delete
                   </button>
                   <button
                     onClick={() => navigate(`/dashboard/packages/${pkg._id}?step=1`)}
                     className="flex-1 flex items-center justify-center gap-1 bg-primary-600  text-white py-1.5 rounded-lg text-sm font-medium transition"
                   >
                     <Edit2 size={16} /> Edit
                   </button>
                 </div>
               </div>
             </div>
           ))}
         </div>
       )}

       {/* Modal */}
       {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
             <div className="flex items-center justify-between p-5 border-b border-gray-100">
               <h2 className="text-xl font-bold">Choose Packages</h2>
               <div className="flex items-center gap-3">
                 <button onClick={saveSelections} className="bg-primary-600 text-white px-4 py-1.5 rounded-lg font-medium transition text-sm">
                   Done
                 </button>
                 <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700 transition">
                   <X size={24} />
                 </button>
             </div>
             </div>

             <div className="p-2 overflow-y-auto flex-1">
                {paginatedAllPkgs.map(pkg => (
                  <label key={pkg._id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition border border-transparent hover:border-gray-100">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(pkg._id)}
                      onChange={() => handleCheckboxChange(pkg._id)}
                      className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="w-16 h-12 rounded overflow-hidden bg-gray-200 shrink-0">
                      {pkg.thumbnail ? (
                        <img src={pkg.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : pkg.gallery && pkg.gallery.length > 0 ? (
                        <img src={pkg.gallery[0].url || pkg.gallery[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                      )}
                    </div>
                    <span className="font-medium text-gray-800 flex-1 truncate">{pkg.packageName}</span>
                  </label>
                ))}
                {allPackages.length === 0 && (
                  <p className="text-center py-4 text-gray-500">No packages found.</p>
                )}
             </div>

             <div className="p-4 border-t border-gray-100 flex items-center justify-center gap-4">
               <button
                 disabled={currentPage === 1}
                 onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                 className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50"
               >
                 &lt; Previous
               </button>
               <div className="flex items-center gap-1">
                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                   <button
                     key={page}
                     onClick={() => setCurrentPage(page)}
                     className={`w-8 h-8 flex items-center justify-center rounded text-sm ${page === currentPage ? 'bg-primary-600 text-white font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
                   >
                     {page}
                   </button>
                 ))}
               </div>
               <button
                 disabled={currentPage === totalPages || totalPages === 0}
                 onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                 className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50"
               >
                 Next &gt;
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}

