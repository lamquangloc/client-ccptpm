import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userService, User } from '../../services/userService';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

export default function AdminUserDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await userService.getUserById(id);
        setUser(data);
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải chi tiết người dùng.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 font-medium">{error || 'User not found'}</p>
        <button onClick={() => navigate('/admin/users')} className="mt-4 text-blue-500 hover:underline">Quay lại danh sách</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <button onClick={() => navigate('/admin/users')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-slate-800">User Details</h1>
        <div className="ml-auto">
           <button 
             onClick={() => navigate(`/admin/users/edit/${user._id}`)}
             className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition shadow-sm shadow-amber-500/30"
           >
             Edit Profile
           </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-12 flex items-end gap-6 mb-8">
            <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-lg">
              {user.avatar && !user.avatar.includes('default') ? (
                <img className="w-full h-full rounded-[20px] object-cover" src={`${API_BASE}${user.avatar}`} alt={user.name} />
              ) : (
                <div className="w-full h-full rounded-[20px] bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400 uppercase">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="pb-1">
              <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
              <p className="text-slate-500 text-sm font-medium">{user.email}</p>
            </div>
            <div className="ml-auto pb-1">
               <span className={`px-4 py-1.5 rounded-2xl text-[11px] font-bold uppercase tracking-wider ${
                 user.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600'
               }`}>
                 {user.role} Account
               </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Basic Information</h3>
              <div className="grid grid-cols-1 gap-4">
                 <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Full Name</p>
                    <p className="text-slate-800 font-semibold">{user.name}</p>
                 </div>
                 <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Email Address</p>
                    <p className="text-slate-800 font-semibold">{user.email}</p>
                 </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Account Status</h3>
              <div className="grid grid-cols-1 gap-4">
                 <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">User ID</p>
                    <p className="text-slate-600 font-mono text-xs">{user._id}</p>
                 </div>
                 <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Join Date</p>
                    <p className="text-slate-800 font-semibold">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN', { 
                        year: 'numeric', month: 'long', day: 'numeric' 
                      }) : 'N/A'}
                    </p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
