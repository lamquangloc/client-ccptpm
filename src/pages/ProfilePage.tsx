import { useState } from 'react';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};

  // Dữ liệu đặt bàn giả lập (tương lai sẽ gọi API fetch)
  const mockOrders = [
    { _id: 'OD-1982', date: '2023-11-12 18:30', tableType: 'VIP', status: 'Hoàn thành', guests: 2 },
    { _id: 'OD-3342', date: '2023-12-25 19:45', tableType: 'Standard', status: 'Đã hủy', guests: 6 },
    { _id: 'OD-8811', date: '2024-03-20 20:00', tableType: 'Private Room', status: 'Chờ xác nhận', guests: 4 },
  ];

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 min-h-[60vh]">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Cột trái: Sidebar điều hướng Profile */}
        <div className="w-full md:w-1/4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center h-fit">
          <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden mb-4 border-2 border-indigo-100 p-1">
             <img 
               src={user?.avatar || 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix'} 
               alt="Avatar" 
               className="w-full h-full object-cover rounded-full"
             />
          </div>
          <h2 className="text-xl font-bold text-slate-800">{user?.name || 'Nguyễn Văn A'}</h2>
          <p className="text-sm text-slate-500 mb-6">{user?.email || 'nguyenvana@gmail.com'}</p>

          <div className="w-full flex-col flex gap-2">
            <button
              onClick={() => setActiveTab('info')}
              className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-colors ${
                activeTab === 'info' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Thông tin cá nhân
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-colors ${
                activeTab === 'history' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Lịch sử đặt bàn
            </button>
          </div>
        </div>

        {/* Cột phải: Content */}
        <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          
          {/* TAB THÔNG TIN CÁ NHÂN */}
          {activeTab === 'info' && (
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">Thông tin cá nhân</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Họ và tên</label>
                  <input 
                    type="text" 
                    defaultValue={user?.name || ''} 
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    defaultValue={user?.email || ''} 
                    disabled
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 bg-slate-50 text-slate-500 cursor-not-allowed" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại</label>
                  <input 
                    type="text" 
                    defaultValue="0987654321" 
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" 
                  />
                </div>
              </div>
              
              <button className="mt-8 bg-indigo-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                Lưu thay đổi
              </button>
            </div>
          )}

          {/* TAB LỊCH SỬ ĐẶT BÀN */}
          {activeTab === 'history' && (
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">Lịch sử đặt bàn</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-sm">
                      <th className="p-4 font-semibold rounded-tl-lg">Mã đặt bàn</th>
                      <th className="p-4 font-semibold">Thời gian</th>
                      <th className="p-4 font-semibold">Loại bàn</th>
                      <th className="p-4 font-semibold">Khách</th>
                      <th className="p-4 font-semibold rounded-tr-lg text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mockOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 text-indigo-600 font-medium">{order._id}</td>
                        <td className="p-4 text-slate-700">{order.date}</td>
                        <td className="p-4 text-slate-700">{order.tableType}</td>
                        <td className="p-4 text-slate-700">{order.guests} người</td>
                        <td className="p-4 text-right">
                          <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'Hoàn thành' ? 'bg-green-100 text-green-700' :
                            order.status === 'Đã hủy' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
