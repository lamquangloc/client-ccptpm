import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Edit, Trash2, Eye, X, 
  ShoppingBag, DollarSign, Clock, CheckCircle, XCircle,
  MoreVertical, ChevronLeft, ChevronRight, User, Phone
} from 'lucide-react';
import { orderService, IOrder, OrderStatus, CreateOrderPayload } from '../../services/orderService';
import { tableService, ITable } from '../../services/tableService';
import { productService, IProduct } from '../../services/productService';
import { bookingService, Booking } from '../../services/bookingService';

// Fallback user token (normally this would be from Context or localStorage)
const dummyToken = localStorage.getItem('token') || '';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [tables, setTables] = useState<ITable[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Drawer & Edit state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [guests, setGuests] = useState<number>(2);
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('pending');
  
  // Order Detail Modal state (Read-only)
  const [viewOrder, setViewOrder] = useState<IOrder | null>(null);

  // Loading state
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchTables();
    fetchProducts();
    fetchBookings();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getAll(dummyToken);
      setOrders(data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách order:', err);
    }
  };

  const fetchTables = async () => {
    try {
      const data = await tableService.getAll();
      setTables(data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách bàn:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách món:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getAllBookings();
      const activeBookings = data.filter(b => b.status === 'pending' || b.status === 'confirmed');
      setBookings(activeBookings);
    } catch (err) {
      console.error('Lỗi khi tải danh sách booking:', err);
    }
  }

  const handleBookingSelect = (bookingId: string) => {
    setSelectedBooking(bookingId);
    if (bookingId) {
      const booking = bookings.find(b => b._id === bookingId);
      if (booking) {
        setCustomerName(booking.name || '');
        setPhone(booking.phone || '');
        setGuests(booking.guests || 2);
      }
    } else {
      setCustomerName('');
      setPhone('');
      setGuests(2);
    }
  };

  const calculateDrawerTotal = () => {
    return selectedProducts.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const handleAddProduct = (productId: string) => {
    if (!productId) return;
    const prod = products.find(p => p._id === productId);
    if (!prod) return;

    setSelectedProducts(prev => {
      const exists = prev.find(p => p.product._id === productId);
      if (exists) {
        return prev.map(p => p.product._id === productId ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { product: prod, quantity: 1 }];
    });
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.product._id !== productId));
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setSelectedProducts(prev => prev.map(p => p.product._id === productId ? { ...p, quantity: newQuantity } : p));
  };

  const handleSubmitOrder = async () => {
    if (!selectedTable) {
      alert("Vui lòng chọn bàn!");
      return;
    }
    if (selectedProducts.length === 0) {
      alert("Vui lòng chọn ít nhất một món!");
      return;
    }

    setLoading(true);
    try {
      const payload: CreateOrderPayload = {
        table: selectedTable,
        products: selectedProducts.map(p => ({
          product: p.product._id || p.product,
          quantity: p.quantity
        })),
        customerName: customerName.trim() !== '' ? customerName : undefined,
        phone: phone.trim() !== '' ? phone : undefined,
        guests,
        status: orderStatus
      };
      
      if (editingOrderId) {
        await orderService.update(dummyToken, editingOrderId, payload);
        alert("Cập nhật đơn hàng thành công!");
      } else {
        await orderService.create(dummyToken, payload);
        alert("Tạo đơn hàng thành công!");
      }
      
      // Reset form
      closeDrawer();
      
      // Khớp trạng thái order & table
      fetchOrders();
      fetchTables();
    } catch (error: any) {
      alert(`Đã xảy ra lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderService.updateStatus(dummyToken, orderId, newStatus);
      fetchOrders();
      // Status complete/cancel có thể đổi trạng thái bàn, nên reload bàn luôn
      if (newStatus === 'complete' || newStatus === 'cancel') {
        fetchTables();
      }
      
      // Update viewOrder if open
      setViewOrder(prev => {
        if (prev && prev._id === orderId) {
          return { ...prev, status: newStatus };
        }
        return prev;
      });
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err);
      alert('Không thể cập nhật trạng thái đơn hàng.');
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingOrderId(null);
    setSelectedBooking('');
    setCustomerName('');
    setPhone('');
    setGuests(2);
    setSelectedTable('');
    setSelectedProducts([]);
    setOrderStatus('pending');
  };

  const openDrawerForNew = () => {
    closeDrawer();
    setIsDrawerOpen(true);
  };

  const openDrawerForEdit = (order: IOrder) => {
    setEditingOrderId(order._id);
    setCustomerName(order.customerName || order.user?.name || '');
    setPhone(order.phone || '');
    setGuests(order.guests || 2);
    setSelectedTable(order.table?._id || '');
    setSelectedProducts(order.products || []);
    setOrderStatus(order.status);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (orderId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa hóa đơn này không?')) {
      try {
        await orderService.delete(dummyToken, orderId);
        fetchOrders();
        // If modal open, close it
        if (viewOrder && viewOrder._id === orderId) {
          setViewOrder(null);
        }
      } catch (err) {
        alert('Có lỗi xảy ra khi xóa!');
      }
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-700 border-green-200';
      case 'confirm': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancel': return 'bg-red-100 text-red-700 border-red-200';
      case 'pending':
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'complete': return 'Complete';
      case 'confirm': return 'Confirmed';
      case 'cancel': return 'Canceled';
      case 'pending': return 'Pending';
      default: return status;
    }
  };

  const totalOrders = orders.length;
  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirm').length;
  const completedOrders = orders.filter(o => o.status === 'complete').length;
  const canceledOrders = orders.filter(o => o.status === 'cancel').length;
  const totalRevenue = orders.filter(o => o.status === 'complete').reduce((sum, o) => sum + o.total, 0);

  const filteredOrders = orders.filter(o => 
    (o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    (o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
  );

  return (
    <div className="p-6 max-w-[1600px] mx-auto w-full font-sans bg-slate-50 min-h-screen relative">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Order Management</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Orders / Order Management</p>
        </div>
        <button 
          onClick={openDrawerForNew}
          className="flex items-center gap-2 bg-[#ff1a1a] hover:bg-[#e60000] text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-red-500/30 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>Create New Order</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-semibold mb-1">Total Orders</p>
            <p className="text-2xl font-black text-slate-800">{totalOrders}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <ShoppingBag size={24} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-semibold mb-1">Active</p>
            <p className="text-2xl font-black text-slate-800">{activeOrders}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-semibold mb-1">Completed</p>
            <p className="text-2xl font-black text-slate-800">{completedOrders}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-semibold mb-1">Canceled</p>
            <p className="text-2xl font-black text-slate-800">{canceledOrders}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <XCircle size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-semibold mb-1">Revenue</p>
            <p className="text-2xl font-black text-slate-800">${totalRevenue.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-t-xl border border-slate-200 border-b-0 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by customer name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 outline-none focus:ring-2 focus:ring-[#ff1a1a]/50 focus:border-[#ff1a1a] rounded-lg transition-all"
          />
        </div>
        <button className="flex items-center gap-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold transition-colors">
          <Filter size={18} />
          <span>Filters</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-b-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 w-12 text-center text-slate-500">
                <input type="checkbox" className="rounded border-slate-300" />
              </th>
              <th className="p-4 text-sm font-semibold text-slate-600">Order ID</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Customer</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Table</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Total Amount</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Status</th>
              <th className="p-4 text-sm font-semibold text-slate-600 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                  No orders found.
                </td>
              </tr>
            ) : filteredOrders.map((order) => (
              <tr key={order._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4 text-center">
                  <input type="checkbox" className="rounded border-slate-300" />
                </td>
                <td className="p-4 text-sm font-medium text-slate-900 border-r border-[#00000005]">
                  #{order._id.substring(order._id.length - 8).toUpperCase()}
                  <div className="text-xs text-slate-400 font-normal mt-0.5">
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-800 font-semibold truncate max-w-[150px]">
                  {order.customerName || order.user?.name || "Guest"}
                  {order.phone && <div className="text-xs text-slate-500 font-normal mt-0.5">{order.phone}</div>}
                </td>
                <td className="p-4 text-sm text-slate-700 font-medium">
                  T{order.table?.number || '?'}
                </td>
                <td className="p-4 text-sm font-bold text-slate-900">
                  ${order.total.toLocaleString()}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                  
                  {/* Inline Status Changer */}
                  {(order.status === 'pending' || order.status === 'confirm') && (
                    <div className="mt-2">
                       <select 
                         className="text-xs border rounded px-1 py-0.5 bg-gray-50 outline-none text-gray-700 cursor-pointer w-full max-w-[120px]"
                         value={order.status}
                         onChange={(e) => handleUpdateStatus(order._id, e.target.value as OrderStatus)}
                       >
                         <option value="pending">Pending</option>
                         <option value="confirm">Confirm</option>
                         <option value="complete">Complete (Paid)</option>
                         <option value="cancel">Cancel</option>
                       </select>
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-3">
                    <button 
                      onClick={() => setViewOrder(order)}
                      className="text-slate-400 hover:text-blue-500 transition-colors" 
                      title="View details"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => openDrawerForEdit(order)}
                      className="text-slate-400 hover:text-orange-500 transition-colors" 
                      title="Edit order"
                    >
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(order._id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                      <Trash2 size={18} />
                    </button>
                    <button className="text-slate-400 hover:text-slate-700 transition-colors" title="More">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal (Read-only) */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setViewOrder(null)} 
          />
          
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all flex flex-col font-sans overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                Order Detail <span className="text-sm font-semibold text-slate-500 ml-2">#{viewOrder._id.substring(viewOrder._id.length - 8).toUpperCase()}</span>
              </h2>
              <button 
                onClick={() => setViewOrder(null)}
                className="text-slate-400 hover:text-red-500 bg-white shadow-sm p-1.5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* Top Row: Customer & Order Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <User size={16} className="text-indigo-500" /> Customer Information
                  </h3>
                  <div className="flex flex-col gap-2 text-sm text-slate-600">
                    <p><span className="font-semibold text-slate-700">Name:</span> {viewOrder.customerName || viewOrder.user?.name || "Guest"}</p>
                    <p><span className="font-semibold text-slate-700">Phone:</span> {viewOrder.phone || "N/A"}</p>
                    <p><span className="font-semibold text-slate-700">Guests:</span> <span className="font-bold text-indigo-600">{viewOrder.guests ?? 'N/A'} người</span></p>
                    <p><span className="font-semibold text-slate-700">Table:</span> <span className="font-bold text-[#ff1a1a]">T{viewOrder.table?.number || '?'}</span></p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                   <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Clock size={16} className="text-yellow-500" /> Order Status
                  </h3>
                  <div className="flex flex-col items-start gap-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getStatusStyle(viewOrder.status)}`}>
                      {getStatusLabel(viewOrder.status)}
                    </span>
                    {(viewOrder.status === 'pending' || viewOrder.status === 'confirm') && (
                      <div className="w-full">
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Change Status</label>
                        <select 
                           className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white font-semibold text-slate-700 cursor-pointer"
                           value={viewOrder.status}
                           onChange={(e) => handleUpdateStatus(viewOrder._id, e.target.value as OrderStatus)}
                         >
                           <option value="pending">Pending</option>
                           <option value="confirm">Confirm</option>
                           <option value="complete">Complete (Paid)</option>
                           <option value="cancel">Cancel</option>
                         </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <h3 className="text-sm font-bold text-slate-700 mb-3 border-b border-slate-100 pb-2 flex justify-between items-center">
                <span>Ordered Items</span>
              </h3>
              
              <div className="flex flex-col gap-3">
                {viewOrder.products.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center py-2 px-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{item.product?.name || 'Unknown'}</span>
                      <span className="text-xs font-semibold text-slate-500">Qty: {item.quantity}  ×  ${item.product?.price || 0}</span>
                    </div>
                    <span className="font-bold text-[#ff1a1a]">${((item.product?.price || 0) * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 p-6 bg-slate-50 flex justify-between items-center">
              <span className="font-bold text-slate-600 uppercase tracking-wide">Total Amount</span>
              <span className="text-3xl font-black text-[#ff1a1a]">
                ${viewOrder.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={closeDrawer} 
          />
          
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Plus size={20} className="text-[#ff1a1a]" /> {editingOrderId ? 'Edit Order' : 'Create New Order'}
              </h2>
              <button 
                onClick={closeDrawer}
                className="text-slate-400 hover:text-red-500 bg-white shadow-sm p-1.5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-bold text-slate-700">Customer Details</label>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold">Optional</span>
                </div>
                
                {!editingOrderId && (
                  <select 
                    value={selectedBooking}
                    onChange={(e) => handleBookingSelect(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-semibold text-slate-700 appearance-none transition-all cursor-pointer mb-2"
                  >
                    <option value="">-- Select from Bookings (Guest) --</option>
                    {bookings.map(b => (
                      <option key={b._id} value={b._id}>
                        {b.name} ({b.phone}) / {b.date} {b.time}
                      </option>
                    ))}
                  </select>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded outline-none focus:border-[#ff1a1a] text-sm text-slate-800 transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="Phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded outline-none focus:border-[#ff1a1a] text-sm text-slate-800 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Số lượng người</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={guests}
                    onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded outline-none focus:border-[#ff1a1a] text-sm text-slate-800 transition-colors"
                  />
                  {selectedBooking && (
                    <p className="text-[11px] text-indigo-500 font-semibold">Đã tự điền từ booking, bạn vẫn có thể chỉnh lại.</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Select Table <span className="text-red-500">*</span></label>
                <select 
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#ff1a1a]/50 focus:border-[#ff1a1a] font-semibold text-slate-700 appearance-none transition-all cursor-pointer"
                >
                  <option value="">-- Choose a table --</option>
                  {tables.map(t => (
                    <option key={t._id} value={t._id} disabled={t.status === 'occupied' && t._id !== selectedTable}>
                      Table {t.number} {t.status === 'occupied' && t._id !== selectedTable ? '(Occupied)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {editingOrderId && (
                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-sm font-bold text-slate-700">Order Status</label>
                  <select 
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#ff1a1a]/50 focus:border-[#ff1a1a] font-semibold text-slate-700 appearance-none transition-all cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirm">Confirm</option>
                    <option value="complete">Complete (Paid)</option>
                    <option value="cancel">Cancel</option>
                  </select>
                </div>
              )}

              <div className="w-full border-t border-slate-100 my-2"></div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">Add Items <span className="text-red-500">*</span></label>
                  <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">{selectedProducts.length} items</span>
                </div>
                
                <select 
                  onChange={(e) => {
                    handleAddProduct(e.target.value);
                    e.target.value = "";
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-semibold text-slate-700 appearance-none transition-all cursor-pointer"
                >
                  <option value="">+ Search or select item...</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name} - ${p.price}</option>
                  ))}
                </select>

                {selectedProducts.length > 0 && (
                  <div className="mt-2 flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                    {selectedProducts.map((item) => (
                      <div key={item.product._id} className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                        <div className="flex-1">
                          <p className="font-bold text-sm text-slate-800">{item.product.name}</p>
                          <p className="text-xs font-semibold text-[#ff1a1a] mt-0.5">${item.product.price}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-slate-200 rounded bg-slate-100">
                            <button 
                              type="button"
                              onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                              className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 font-bold transition-colors"
                            >-</button>
                            <span className="px-2 text-sm font-bold bg-white h-full border-x border-slate-200 w-8 text-center">{item.quantity}</span>
                            <button 
                              type="button"
                              onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                              className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 font-bold transition-colors"
                            >+</button>
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleRemoveProduct(item.product._id)}
                            className="text-slate-400 hover:text-red-500 p-1.5 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-200 p-6 bg-slate-50 flex flex-col gap-4">
              <div className="flex justify-between items-center bg-white border border-slate-200 px-4 py-3 rounded-lg shadow-sm">
                <span className="font-bold text-slate-600 uppercase tracking-wide text-sm">Total Amount</span>
                <span className="text-2xl font-black text-[#ff1a1a] drop-shadow-sm">
                  ${calculateDrawerTotal().toLocaleString()}
                </span>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={closeDrawer}
                  className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmitOrder}
                  disabled={loading || selectedProducts.length === 0 || !selectedTable}
                  className="flex-[2] py-3 bg-[#ff1a1a] hover:bg-[#e60000] disabled:bg-red-300 text-white rounded-lg font-bold shadow-lg shadow-red-500/30 transition-all flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span>
                  ) : (
                    <>
                      {editingOrderId ? 'Update Order' : 'Save Order'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
