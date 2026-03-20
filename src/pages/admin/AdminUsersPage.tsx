import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, User } from '../../services/userService';
import ConfirmModal from '../../components/ConfirmModal';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string, name: string } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getUsers({ search: searchTerm });
      setUsers(res.users);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lấy danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only search after small debounce
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

   const handleDeleteClick = (id: string, name: string) => {
     setUserToDelete({ id, name });
     setModalOpen(true);
   };

   const confirmDelete = async () => {
     if (!userToDelete) return;
     try {
       await userService.deleteUser(userToDelete.id);
       setUsers(users.filter(u => u._id !== userToDelete.id));
     } catch (err: any) {
       alert(err.message || 'Cannot delete user.');
     } finally {
       setUserToDelete(null);
     }
   };

  // Helper to get fallback avatar
  const getAvatarFallback = (user: User, index: number) => {
    const char = user.name ? user.name.charAt(0).toUpperCase() : '?';
    const bgColors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-rose-100 text-rose-600',
      'bg-amber-100 text-amber-600'
    ];
    const color = bgColors[index % bgColors.length];
    return { char, color };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800">Accounts</h1>
          <div className="relative">
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search accounts..."
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={() => navigate('/admin/users/create')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 backdrop-blur-[1px]">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-gray-100 text-xs text-slate-500 uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">ID User</th>
                <th className="px-6 py-4">User Name</th>
                <th className="px-6 py-4">Email / Role</th>
                <th className="px-6 py-4 text-center">Hành Động (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!loading && users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No users found {searchTerm && `matching "${searchTerm}"`}
                  </td>
                </tr>
              ) : (
                users.map((user, i) => {
                  const fallback = getAvatarFallback(user, i);
                  return (
                    <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium whitespace-nowrap">
                        <span className="bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono text-xs">#{user._id.slice(-6)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar && !user.avatar.includes('default') ? (
                            <img className="w-8 h-8 rounded-full flex-shrink-0 object-cover border border-gray-200" src={`${API_BASE}${user.avatar}`} alt={user.name} />
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${fallback.color}`}>
                              {fallback.char}
                            </div>
                          )}
                          <span className="font-semibold text-slate-800">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                           <span className="text-sm text-slate-600 font-medium">{user.email}</span>
                           <span className={`text-[10px] uppercase tracking-wider max-w-max px-2 py-0.5 rounded-full font-bold ${
                              user.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'
                           }`}>{user.role}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => navigate(`/admin/users/view/${user._id}`)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                            title="View"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => navigate(`/admin/users/edit/${user._id}`)}
                            className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" 
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(user._id, user.name)} 
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" 
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination/Footer */}
        {!loading && users.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-center">
            <p className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-700">{users.length}</span> results
            </p>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        title="Xóa người dùng"
        message={`Bạn có chắc chắn muốn xóa người dùng "${userToDelete?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa tài khoản"
        cancelText="Hủy bỏ"
        type="danger"
      />
    </div>
  );
}
