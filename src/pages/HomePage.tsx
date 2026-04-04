import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    fetch(`${API_URL}/products`)
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const handleDishClick = (dishName: string) => {
    const found = products.find(p => p.name.toLowerCase() === dishName.toLowerCase());
    if (found) {
      navigate(`/product/${found._id}`);
    } else {
      navigate('/menu');
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* 1. Hero Banner Section */}
      <section 
        className="relative h-[80vh] min-h-[500px] flex items-center justify-center bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: "url('/UI/image 6.png')" }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto transform hover:scale-105 transition-transform duration-700">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg tracking-wide">
            Chào mừng đến với nhà hàng ICE
          </h1>
          <p className="text-lg md:text-2xl text-gray-100 font-light drop-shadow-md">
            Trải nghiệm những món ăn tuyệt vời với những món ăn đa dạng
          </p>
        </div>
      </section>

      {/* 2. Featured Dish Section (Cá kho làng Vũ Đại) */}
      <section 
        className="relative py-20 px-6 bg-cover bg-center"
        style={{ backgroundImage: "url('/UI/image 8.png')" }}
      >
        <div className="absolute inset-0 bg-orange-100/80 backdrop-blur-sm hidden md:block"></div>
        <div className="relative z-10 max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12">
          {/* Info Side */}
          <div className="w-full md:w-1/2 space-y-6 bg-white/60 p-8 rounded-2xl shadow-xl backdrop-blur-md">
            <h2 className="text-3xl font-bold text-red-600 tracking-tight uppercase">Món ăn tiêu biểu</h2>
            <h3 className="text-4xl md:text-5xl font-black text-gray-800">Cá kho làng Vũ Đại</h3>
            <p className="text-2xl font-bold text-red-600">Giá chỉ từ <span className="text-4xl">đ250000</span></p>
            <p className="font-semibold text-gray-700 text-lg">& đậm hương vị quê</p>
            <p className="text-gray-600 leading-relaxed text-justify">
              Cá kho làng Vũ Đại (Hà Nam) là đặc sản trứ danh, nổi tiếng với quy trình chế biến công phu 12-16 tiếng bằng củi nhãn, niêu đất, sử dụng cá trắm đen, thịt ba chỉ và gia vị tự nhiên. Món ăn có hương vị đậm đà, xương mềm rục, thường được ưa chuộng dịp Tết.
            </p>
            <button onClick={() => handleDishClick('Cá kho làng Vũ Đại')} className="mt-4 px-8 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition-colors shadow-lg hover:shadow-red-600/30">
              Khám Phá Ngay
            </button>
          </div>
          {/* Image Side */}
          <div onClick={() => handleDishClick('Cá kho làng Vũ Đại')} className="w-full md:w-1/2 flex justify-center group cursor-pointer">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 transform group-hover:-translate-y-2">
              <img src="/UI/image 7.png" alt="Cá Kho Làng Vũ Đại" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. About & Time Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/3 flex justify-center">
            <div 
              className="bg-[#f2e6d5] p-12 rounded-full aspect-square flex flex-col items-center justify-center text-center shadow-lg hover:shadow-2xl transition-shadow border-4 border-dashed border-[#dabc99] relative overflow-hidden"
              style={{ backgroundImage: "url('/UI/image 9.png')", backgroundSize: 'cover', backgroundBlendMode: 'overlay' }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 z-10">Thời gian phục vụ</h3>
              <p className="text-2xl font-black text-red-700 z-10">24/7 : 6h - 23h</p>
            </div>
          </div>
          <div className="w-full md:w-2/3 space-y-6">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase">NHÀ HÀNG ICE</h2>
            <div className="w-20 h-2 bg-red-600 rounded-full"></div>
            <p className="text-lg text-gray-600 leading-loose">
              Nhà hàng ICE là điểm đến lý tưởng dành cho những ai yêu thích ẩm thực truyền thống Việt Nam. Với không không gian rộng rãi, thoáng đãng, được trang trí tinh tế và hiện đại, ICE mang đến cảm giác thư giãn ngay từ khi bước vào. Mỗi món ăn tại đây đều được chế biến tỉ mỉ từ nguyên liệu tươi ngon, giữ trọn vẹn hương vị đặc trưng của ẩm thực Việt.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Menu Highlight Section */}
      <section className="relative w-full max-w-[1400px] mx-auto py-12 px-4 shadow-2xl mt-12 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2">
          
            {/* Cột 1: Món mặn chuẩn vị (Background image 13) */}
          <div 
            className="flex flex-col space-y-12 py-16 px-4 md:px-10 bg-[length:100%_100%] bg-no-repeat bg-center relative"
            style={{ backgroundImage: "url('/UI/image 13.png')" }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-red-600 text-center tracking-wider drop-shadow-sm mb-12">Món mặn chuẩn vị</h2>
            
            <div className="flex flex-col sm:flex-row justify-center gap-8 md:gap-12 relative z-10">
              {/* Dish 1: Thịt kho tiêu */}
              <div onClick={() => handleDishClick('Thịt kho tiêu')} className="text-center group cursor-pointer flex flex-col items-center w-full sm:w-1/2">
                <div className="w-48 h-48 md:w-60 md:h-60 rounded-full overflow-hidden shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <img src="/UI/image 20.png" alt="Thịt kho tiêu" className="w-full h-full object-cover rounded-full" />
                </div>
                <h4 className="mt-6 font-bold text-red-600 text-base md:text-xl uppercase drop-shadow-md">THỊT KHO TIÊU</h4>
                <p className="text-sm text-red-800/90 italic">Braised meat with pepper</p>
                <p className="text-red-700 font-black mt-2 text-xl">85.000đ</p>
              </div>

              {/* Dish 2: Thịt rim trứng cút */}
              <div onClick={() => handleDishClick('Thịt rim trứng cút')} className="text-center group cursor-pointer flex flex-col items-center w-full sm:w-1/2">
                <div className="w-48 h-48 md:w-60 md:h-60 rounded-full overflow-hidden shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <img src="/UI/Ellipse 13.png" alt="Thịt rim trứng cút" className="w-full h-full object-cover rounded-full" />
                </div>
                <h4 className="mt-6 font-bold text-green-700 text-base md:text-xl uppercase drop-shadow-md">THỊT RIM TRỨNG CÚT</h4>
                <p className="text-sm text-green-900/90 italic">Simmered pork with quail egg</p>
                <p className="text-green-800 font-black mt-2 text-xl">Giá: 79.000đ</p>
              </div>
            </div>
            
            {/* Dish 3 Bottom Left: Thịt luộc mắm tôm */}
            <div onClick={() => handleDishClick('Thịt luộc mắm tôm')} className="text-center group cursor-pointer mt-32 md:mt-40 flex flex-col items-center relative z-10 transform translate-y-16 md:translate-y-28">
              <div className="w-[110%] md:w-[125%] max-w-[600px] overflow-visible group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_25px_35px_rgba(0,0,0,0.5)]">
                <img src="/UI/image 19.png" alt="Thịt luộc mắm tôm" className="w-full h-auto object-contain scale-110" />
              </div>
              <h4 className="mt-12 font-bold text-yellow-500 text-2xl uppercase drop-shadow-lg">THỊT LUỘC MẮM TÔM</h4>
              <p className="text-base text-yellow-100 italic">Boiled pork with shrimp paste</p>
              <p className="text-yellow-400 font-black mt-2 text-2xl drop-shadow-md">59.000đ</p>
            </div>
          </div>

          {/* Cột 2: Món kho miền quê (Background image 17) */}
          <div 
            className="flex flex-col space-y-12 py-16 px-4 md:px-10 bg-[length:100%_100%] bg-no-repeat bg-center relative"
            style={{ backgroundImage: "url('/UI/image 17.png')" }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-teal-700 text-center tracking-wider drop-shadow-sm mb-12">Món kho miền quê</h2>
            
            <div className="flex flex-col sm:flex-row justify-center gap-8 md:gap-12 relative z-10">
              {/* Dish 4: Cá lóc kho tộ */}
              <div onClick={() => handleDishClick('Cá lóc kho tộ')} className="text-center group cursor-pointer flex flex-col items-center w-full sm:w-1/2">
                <div className="w-48 h-48 md:w-60 md:h-60 rounded-full overflow-hidden shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <img src="/UI/Ellipse 15.png" alt="Cá lóc kho tộ" className="w-full h-full object-cover rounded-full" />
                </div>
                <h4 className="mt-6 font-bold text-teal-800 text-base md:text-xl uppercase drop-shadow-md">CÁ LÓC KHO TỘ</h4>
                <p className="text-sm text-teal-900/90 italic">Caramelized snakehead fish</p>
                <p className="text-teal-900 font-black mt-2 text-xl">Giá: 89.000đ</p>
              </div>

              {/* Dish 5: Thịt kho tiêu */}
              <div onClick={() => handleDishClick('Thịt kho tiêu')} className="text-center group cursor-pointer flex flex-col items-center w-full sm:w-1/2">
                <div className="w-48 h-48 md:w-60 md:h-60 rounded-full overflow-hidden shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <img src="/UI/Ellipse 14.png" alt="Thịt kho tiêu" className="w-full h-full object-fill rounded-full" />
                </div>
                <h4 className="mt-6 font-bold text-teal-800 text-base md:text-xl uppercase drop-shadow-md">THỊT KHO TIÊU</h4>
                <p className="text-sm text-teal-900/90 italic">Caramelized pork with pepper</p>
                <p className="text-teal-900 font-black mt-2 text-xl">Giá: 79.000đ</p>
              </div>
            </div>

            {/* Dish 6 Bottom Right: Cá lăng thịt ba chỉ */}
            <div onClick={() => handleDishClick('Cá lăng thịt ba chỉ')} className="text-center group cursor-pointer mt-28 flex flex-col items-center relative z-10 md:translate-y-2">
              <div className="w-[85%] max-w-[500px] overflow-hidden group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_25px_35px_rgba(0,0,0,0.5)]">
                <img src="/UI/image 21.png" alt="Cá lăng thịt ba chỉ" className="w-full h-auto object-contain" />
              </div>
              <h4 className="mt-8 font-bold text-white text-2xl uppercase drop-shadow-lg">CÁ LĂNG THỊT BA CHỈ</h4>
              <p className="text-base text-gray-200 italic">Caramelized bagridae with side pork</p>
              <p className="text-white font-black mt-2 text-2xl drop-shadow-md">Giá: 129.000đ</p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Services Section */}
      <section className="py-24 px-6 bg-[#fcf9f2] relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute top-10 left-10 w-20 h-20 border-4 border-dashed border-red-200 rounded-full opacity-50"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 border-4 border-dotted border-teal-200 rounded-full opacity-50"></div>
        <div className="absolute top-1/2 inset-x-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-200/40 to-transparent -translate-y-1/2"></div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-teal-800 drop-shadow-sm mb-6">Điểm Cộng Cực Yêu Tại ICE</h2>
            <p className="text-orange-900/80 max-w-2xl mx-auto text-xl font-medium">Ngoài những mâm cơm ngon nức nở ấm bụng, tụi mình còn có một không gian siêu "chill" và sự chăm sóc nhiệt tình hệt như người nhà!</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
            {/* Service 1 */}
            <div className="group p-8 rounded-[2rem] bg-white border-4 border-dashed border-red-200 hover:border-red-400 hover:-translate-y-2 transition-all duration-300 shadow-xl shadow-red-900/5 relative">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-4 bg-red-100 rounded-full"></div>
              <div className="w-24 h-24 mx-auto bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-red-800 mb-4">Không Gian Ấm Áp</h3>
              <p className="text-gray-600 leading-relaxed text-lg">Chỗ ngồi luôn thoải mái, góc chụp hình mộc mạc siêu xinh, cực kì hợp lý để gia đình quây quần hay làm chầu hẹn hò thư giãn.</p>
            </div>
            
            {/* Service 2 */}
            <div className="group p-8 rounded-[2rem] bg-white border-4 border-dashed border-teal-200 hover:border-teal-400 hover:-translate-y-2 transition-all duration-300 shadow-xl shadow-teal-900/5 relative md:translate-y-8">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-4 bg-teal-100 rounded-full"></div>
              <div className="w-24 h-24 mx-auto bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-teal-800 mb-4">Đồ Ăn Bao Tươi</h3>
              <p className="text-gray-600 leading-relaxed text-lg">Thịt cá, rau củ đều được bác bếp trưởng thân chinh đi chợ sớm gom về. Đồ ăn hễ ra đĩa là phải đảm bảo ngon miệng - sạch bụng!</p>
            </div>
            
            {/* Service 3 */}
            <div className="group p-8 rounded-[2rem] bg-white border-4 border-dashed border-yellow-300 hover:border-yellow-500 hover:-translate-y-2 transition-all duration-300 shadow-xl shadow-yellow-900/5 relative">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-4 bg-yellow-200 rounded-full"></div>
              <div className="w-24 h-24 mx-auto bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:bg-yellow-500 group-hover:text-white transition-all">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-yellow-700 mb-4">Phục Vụ Siêu Nhiệt Tình</h3>
              <p className="text-gray-600 leading-relaxed text-lg">Mấy bạn nhân viên lúc nào cũng tươi rói, gọi là dạ vâng có mặt liền. Khách cứ xuề xòa ăn ngon, mọi thứ lặt vặt tụi mình lo tuốt!</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonials Section */}
      <section className="py-24 px-6 bg-[#fdfaf2] relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-red-200 rounded-full mix-blend-multiply opacity-30 blur-2xl"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-teal-200 rounded-full mix-blend-multiply opacity-30 blur-2xl"></div>
        <div className="absolute top-1/4 left-1/4 w-12 h-12 border-4 border-dotted border-yellow-300 rounded-full opacity-50"></div>
        <div className="absolute bottom-1/4 right-1/3 w-8 h-8 bg-teal-300 rounded-lg rotate-12 opacity-30"></div>
        <div className="absolute top-10 left-1/3 text-4xl opacity-20">🍃</div>
        <div className="absolute top-2/3 right-10 text-4xl opacity-20">🌻</div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20 relative inline-block mx-auto left-1/2 -translate-x-1/2">
            <h2 className="text-4xl md:text-5xl text-red-800 font-black mb-4 tracking-tight drop-shadow-sm">Khách Thương, Khách Nhớ</h2>
            <div className="absolute -bottom-2 inset-x-0 h-4 bg-yellow-300/50 -z-10 rounded shadow-sm"></div>
            <p className="text-gray-500 mt-6 text-lg italic tracking-wide">"Ngại gì vài dòng khen, ăn thử là ghiền luôn anh em ơi!"</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[ 
               { name: "Chú Hùng", role: "Khách ruột cuối tuần", text: "Cá kho làng Vũ Đại ở đây nấu cực phẩm! Thịt cá chắc nịch, xương rục mềm tan trong miệng. Ăn kèm bát cơm trắng ta nói nó dính gì đâu, cứ như về quê ăn Tết với ông bà vậy á.", border: "border-red-300", blob: "bg-red-100 text-red-500", nameColor: "text-red-700" },
               { name: "Chị Lan Vy", role: "Dân văn phòng", text: "Cái đĩa thịt luộc mắm tôm ngon xuất sắc. Mắm pha chua ngọt sủi bọt siêu cuốn, thịt luộc thái mỏng giòn sần sật. Tan ca thèm mồi ngon mà ngồi nhâm nhi thì đánh bay mọi muộn phiền!", border: "border-teal-300", blob: "bg-teal-100 text-teal-500", nameColor: "text-teal-700" },
               { name: "Mỹ Trang", role: "Tiktoker Ẩm Thực", text: "Quán decor kiểu đồng quê mộc mạc nhìn cưng xỉu, đứng vào góc nào cũng ra hình mang về tha hồ sống ảo. Ăn no bụng, giá hạt dẻ mà nhân viên còn dễ thương chịu khó nữa hihi!", border: "border-yellow-400", blob: "bg-yellow-100 text-yellow-600", nameColor: "text-yellow-700" }
            ].map((review, i) => (
              <div key={i} className={`bg-white p-10 rounded-3xl border-4 border-dashed ${review.border} relative mt-4 transform hover:-translate-y-3 hover:rotate-1 transition-transform duration-300 shadow-[8px_8px_0_0_rgba(0,0,0,0.05)]`}>
                <div className={`absolute -top-6 -left-4 w-12 h-12 rounded-full flex justify-center items-center shadow-inner ${review.blob}`}>
                   <span className="text-5xl font-serif leading-none mt-6">"</span>
                </div>
                <div className="flex text-yellow-500 mb-6 relative z-10">
                  {[...Array(5)].map((_, idx) => <svg key={idx} className="w-6 h-6 fill-current drop-shadow-sm hover:scale-125 transition-transform" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>)}
                </div>
                <p className="text-gray-700 font-medium mb-8 relative z-10 leading-relaxed text-lg">"{review.text}"</p>
                <div className="flex flex-col relative z-10 border-t-2 border-dotted border-gray-200 pt-6 mt-auto">
                  <span className={`font-black uppercase tracking-wider ${review.nameColor} text-xl`}>{review.name}</span>
                  <span className="text-sm text-gray-500 mt-1 font-semibold">{review.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Call To Action (Booking) */}
      <section 
        className="relative py-32 px-6 bg-cover bg-fixed bg-center border-t-[16px] border-double border-orange-200"
        style={{ backgroundImage: "url('/UI/image 6.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#2e1503] via-[#4d240b]/80 to-[#2e1503]/60 backdrop-blur-[1px]"></div>
        
        {/* Playful Floating Decors */}
        <div className="absolute top-10 right-10 md:top-24 md:right-40 animate-bounce flex space-x-2 drop-shadow-2xl">
            <span className="text-5xl brightness-125">🍻</span>
        </div>
        <div className="absolute bottom-10 left-10 md:bottom-24 md:left-40 flex space-x-2 drop-shadow-2xl opacity-80" style={{ animation: 'bounce 3s infinite' }}>
            <span className="text-5xl">🍲</span>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center p-12 bg-white/5 backdrop-blur-md rounded-[3rem] border border-white/20 shadow-2xl overflow-hidden">
          {/* Shine effect */}
          <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-[shimmer_5s_infinite]"></div>
          
          <h2 className="text-5xl md:text-6xl font-black text-yellow-400 mb-8 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] tracking-tight">
            Bụng Sôi Cồn Cào? 
            <br className="md:hidden" />
            <span className="text-white drop-shadow-[0_2px_2px_rgba(255,0,0,0.5)]"> Lên Kèo Chốt Đơn!</span>
          </h2>
          <p className="text-orange-50 text-xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Đừng vắt óc nghĩ xem hôm nay ăn gì nữa! Nhấc máy gọi đồng bọn, quấn lấy người yêu hay rủ ngay nhị vị phụ huynh tới ICE làm bữa cơm quê ấm nồng xua tan mọi mỏi mệt ngay thôi!
          </p>
          <a href="/booking" className="inline-block px-12 py-5 bg-gradient-to-r from-yellow-300 to-yellow-500 hover:from-yellow-400 hover:to-yellow-600 transform hover:-translate-y-2 hover:rotate-1 transition-all text-red-900 font-black text-2xl md:text-3xl rounded-2xl shadow-[6px_6px_0_0_#7f1d1d] hover:shadow-[10px_10px_0_0_#450a0a] ring-4 ring-yellow-400 border-2 border-red-900/50">
            🥢 TỚI LUN SHOP ƯI!
          </a>
        </div>
      </section>

    </div>
  );
}
