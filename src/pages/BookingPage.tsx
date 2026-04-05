import { useState } from "react";
import { Phone, Mail, MapPin, Info } from "lucide-react";

// Images (will be replaced by user later, using placeholders for now)
const bookingBg = "/UI/image 13.png";
const burgerImg = "/UI/image 23.png";
const chickenImg = "/UI/image 22.png";

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`w-full rounded-md px-4 py-3 outline-none text-slate-800 bg-white font-medium ${props.className || ""}`} />
);

const Button = ({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...props} className={`rounded-md px-6 py-2 transition-colors font-bold ${className || ""}`}>
    {children}
  </button>
);

const BookingPage = () => {
  const [form, setForm] = useState({ name: "", phone: "", date: "", time: "" });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleBook = async () => {
    if (!form.name || !form.phone || !form.date || !form.time) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      // Dynamic import to avoid changing top level imports if possible, or just add the import at the top.
      const { bookingService } = await import('../services/bookingService');
      await bookingService.createBooking({
        name: form.name,
        phone: form.phone,
        date: form.date,
        time: form.time,
        guests: 2 // default
      });
      alert("Đặt bàn thành công! Hệ thống đã ghi nhận.");
      setForm({ name: "", phone: "", date: "", time: "" });
    } catch (error: any) {
      alert("Lỗi khi đặt bàn: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1118] text-white py-16 flex flex-col items-center font-sans overflow-hidden">

      {/* 1. Header */}
      <div className="text-center mb-10">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">Đặt Bàn Nhà Hàng</h1>
        <p className="text-[#00ff00] text-lg md:text-2xl font-medium tracking-wide">Đặt bàn dễ dàng, trải nghiệm tuyệt vời</p>
      </div>

      {/* 2. Info Card */}
      <div className="w-full max-w-3xl border border-gray-600 rounded-xl p-6 md:p-8 mb-12 flex gap-4 bg-[#0a1118]/80 backdrop-blur-sm z-10 relative shadow-xl">
        <div className="flex-shrink-0 mt-1">
          <Info size={28} className="text-[#00ff00]" />
        </div>
        <div>
          <h2 className="text-[#ff1a1a] text-xl md:text-2xl font-extrabold tracking-wide mb-2">Thông tin quan trọng</h2>
          <p className="text-[#ff00ff] text-base mb-1 font-medium">Giờ mở cửa: 10:00 - 22:00</p>
          <p className="text-[#ff00ff] text-base font-medium">Chính sách: Giữ bàn trong 30' phút kể từ giờ đặt</p>
        </div>
      </div>

      {/* 3. Booking Section */}
      <section
        className="relative w-full max-w-[1100px] rounded-md overflow-hidden mb-24 shadow-2xl z-20 border border-gray-800"
        style={{ backgroundImage: `url('${bookingBg}')`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 flex flex-col md:flex-row gap-8 p-8 md:p-14">
          {/* Contact Info */}
          <div className="flex flex-col gap-10 md:w-5/12 pr-4">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-[#ffcc00] flex items-center justify-center flex-shrink-0">
                <Phone size={24} className="text-black" fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <p className="font-black text-2xl tracking-widest text-[#ff1a1a]" style={{ WebkitTextStroke: '1px #ff1a1a', WebkitTextFillColor: 'transparent' }}>Hotline</p>
                <p className="text-[#00ffff] font-bold text-base mt-1 tracking-wide">1900 1234</p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-[#ffcc00] flex items-center justify-center flex-shrink-0">
                <Mail size={24} className="text-black" fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <p className="font-black text-2xl tracking-widest text-[#ff1a1a]" style={{ WebkitTextStroke: '1px #ff1a1a', WebkitTextFillColor: 'transparent' }}>Info</p>
                <p className="text-[#00ffff] font-bold text-base mt-1 tracking-wide">info@foodio.com</p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-[#ffcc00] flex items-center justify-center flex-shrink-0">
                <MapPin size={24} className="text-black" fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <p className="font-black text-2xl tracking-widest text-[#ff1a1a]" style={{ WebkitTextStroke: '1px #ff1a1a', WebkitTextFillColor: 'transparent' }}>Location</p>
                <p className="text-[#00ffff] font-bold text-sm mt-1 leading-snug tracking-wide">New Street Town 2512x (U.S)</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="flex-1 flex flex-col gap-5 mt-6 md:mt-0 justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              <Input
                placeholder="Phone No"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
              <Input
                type="date"
                placeholder="Date"
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className="text-gray-500 placeholder-gray-400"
              />
              <Input
                type="time"
                placeholder="Time"
                value={form.time}
                onChange={(e) => handleChange("time", e.target.value)}
                className="text-gray-500 placeholder-gray-400"
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button 
                onClick={handleBook}
                className="bg-[#ff00ff] hover:bg-[#d600d6] text-white px-10 py-3 rounded-lg font-bold text-lg shadow-[0_0_15px_rgba(255,0,255,0.5)]"
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom Images Section */}
      <div className="w-full max-w-[1200px] px-4 flex flex-col md:flex-row justify-between items-center z-10 relative gap-16 md:gap-0 mt-8">

        {/* Left Burger Image (Rotated Square) */}
        <div className="w-64 h-64 md:w-[26rem] md:h-[26rem] bg-[#1a222c] rounded-[2rem] transform -rotate-[15deg] overflow-hidden shadow-2xl relative ml-0 md:ml-12 group transition-all hover:-rotate-12 duration-500">
          <img src={burgerImg} alt="Burger Placeholder" className="w-full h-full object-cover transform rotate-[15deg] scale-125 group-hover:scale-110 transition-transform duration-700" />
        </div>

        {/* Right Chicken Image (Circle) */}
        <div className="w-72 h-72 md:w-[30rem] md:h-[30rem] bg-[#1a222c] rounded-full overflow-hidden shadow-2xl relative mr-0 md:mr-10 group flex items-center justify-center">
          <img src={chickenImg} alt="Chicken Placeholder" className="w-full h-full object-cover scale-[1.6] group-hover:scale-[1.8] transition-transform duration-700" />
        </div>

      </div>

    </div>
  );
};

export default BookingPage;