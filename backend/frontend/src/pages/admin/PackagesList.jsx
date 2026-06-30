import React, { useEffect, useState } from 'react';
import { apiGet, apiDelete } from '../../utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit, Search } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/Table";

export default function PackagesList() {
  const [packages, setPackages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const [pkgsData, cats] = await Promise.all([
        apiGet(`/api/packages?page=${page}&search=${search}&category=${category}&limit=10`),
        apiGet('/api/categories').catch(() => [])
      ]);
      setPackages(pkgsData.data || []);
      setTotalPages(pkgsData.totalPages || 1);
      setCategories(cats);
    } catch {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, search, category]);

  const runDelete = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      await apiDelete(`/api/packages/${id}`);
      toast.success("Deleted successfully");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
       <div className="mb-6 flex items-center justify-between">
         <h1 className="text-2xl font-bold">Packages Management</h1>
         <button onClick={() => navigate('/dashboard/packages/new?step=1')} className="px-4 py-2  text-white font-medium rounded bg-primary-600">
           + Add New Package
         </button>
       </div>

       {/* Filters */}
       <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="relative">
           <input
             type="text"
             placeholder="Search by package name..."
             value={search}
             onChange={(e) => { setSearch(e.target.value); setPage(1); }}
             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none"
           />
           <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
         </div>
         
         <select
           value={category}
           onChange={(e) => { setCategory(e.target.value); setPage(1); }}
           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
         >
           <option value="">All Categories</option>
           {categories.map(cat => (
             <option key={cat._id} value={cat._id}>{cat.name}</option>
           ))}
         </select>
       </div>
       
       <div className="bg-white rounded-xl shadow-sm p-6 overflow-x-auto">
         <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Packages List</h2>
         </div>

         {loading ? (
            <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
         ) : packages.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No packages found matching your criteria.</p>
         ) : (
           <>
             <Table className="w-full text-left">
               <TableHeader>
                 <TableRow className="border-b border-gray-300">
                   <TableHead className="font-semibold text-gray-600 uppercase py-3">Package Name</TableHead>
                   <TableHead className="font-semibold text-gray-600 uppercase py-3">Category</TableHead>
                   <TableHead className="font-semibold text-gray-600 uppercase py-3">Duration</TableHead>
                   <TableHead className="font-semibold text-gray-600 uppercase py-3">Price â‚¹</TableHead>
                   <TableHead className="text-center font-semibold text-gray-600 uppercase py-3">Actions</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {packages.map(p => (
                   <TableRow key={p._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <TableCell className="py-4 font-medium">
                        <div className="flex items-center gap-3">
                          {p.thumbnail ? (
                            <img src={p.thumbnail} alt="" className="w-10 h-7 object-cover rounded border border-gray-200" />
                          ) : (
                            <div className="w-10 h-7 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-[10px] text-gray-400">No Image</div>
                          )}
                          <span>{p.packageName}</span>
                        </div>
                      </TableCell>
                     <TableCell className="py-4 text-gray-600">{typeof p.parentCategory === 'object' ? p.parentCategory?.name : (p.parentCategory || 'N/A')}</TableCell>
                     <TableCell className="py-4 text-gray-600">{p.duration || 'N/A'}</TableCell>
                     <TableCell className="py-4 text-gray-600">â‚¹{p.offerPriceINR || p.originalPriceINR}</TableCell>
                     <TableCell className="py-4 text-center">
                       <div className="flex gap-3 justify-center">
                          <button onClick={() => navigate(`/dashboard/packages/${p._id}?step=1`)} className="bg-primary-600 p-2 text-white rounded hover:bg-primary-700 transition shadow-sm"><Edit size={16}/></button>
                          <button onClick={() => runDelete(p._id)} className="bg-red-600 p-2 text-white rounded hover:bg-red-700 transition shadow-sm"><Trash2 size={16}/></button>
                       </div>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>

             {/* Pagination Controls */}
             <div className="mt-6 flex items-center justify-between border-t pt-4">
                <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                    <button 
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 transition shadow-sm text-sm font-medium"
                    >Previous</button>
                    <button 
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 transition shadow-sm text-sm font-medium"
                    >Next</button>
                </div>
             </div>
           </>
         )}
       </div>
    </div>
  )
}

