import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white py-16 px-4 md:px-10 lg:px-16 container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
        
        {/* Cột 1: Box Information */}
        <div className="bg-[#aab09f] rounded-[28px] p-8 text-white relative shadow-sm min-h-[340px] flex flex-col justify-between">
          <div className="flex flex-col items-start xl:items-center xl:text-center mb-6">
            <img 
              src="/icons/logo_restaurant.png" 
              alt="Ice Restaurant Logo" 
              className="h-16 w-auto object-contain"
            />
          </div>

          <div className="flex flex-col gap-1.5 xl:text-center px-2">
            <p className="font-semibold text-[15px] leading-relaxed">
              Monday - Saturday: <br /> 10:00am - 22:00pm
            </p>
            <p className="font-semibold text-[15px] underline mt-1 opacity-90">
              Closed on Sunday
            </p>
          </div>
          
          <p className="font-bold text-[15px] mt-10 xl:text-center px-2 z-10">
            5 star rated on TripAdvisor
          </p>
        </div>

        {/* Cột 2: About */}
        <div className="lg:pl-8">
          <h3 className="text-2xl font-[800] text-black mb-8 relative inline-block">
            About
            <span className="absolute left-0 bottom-[-2px] w-[80%] h-1 bg-[#ffdb33]"></span>
          </h3>
          <ul className="space-y-5 text-gray-700 font-semibold flex flex-col items-start xl:items-end w-full lg:w-[130px]">
            <li><Link className="hover:text-black transition-colors" to="#">Fredoka One</Link></li>
            <li><Link className="hover:text-black transition-colors" to="#">Special Dish</Link></li>
            <li><Link className="hover:text-black transition-colors" to="#">Reservation</Link></li>
            <li><Link className="hover:text-black transition-colors" to="#">Contact {'>'}</Link></li>
          </ul>
        </div>

        {/* Cột 3: Menu */}
        <div className="lg:pl-0">
          <h3 className="text-2xl font-[800] text-black mb-8 relative inline-block">
            Menu
            <span className="absolute left-0 bottom-[-2px] w-[80%] h-1 bg-[#ffdb33]"></span>
          </h3>
          <ul className="space-y-5 text-gray-700 font-semibold">
            <li><Link className="hover:text-black transition-colors" to="#">Steaks {'>'}</Link></li>
            <li><Link className="hover:text-black transition-colors" to="#">Burgers {'>'}</Link></li>
            <li><Link className="hover:text-black transition-colors" to="#">Coctails {'>'}</Link></li>
            <li><Link className="hover:text-black transition-colors" to="#">Bar B Q {'>'}</Link></li>
            <li><Link className="hover:text-black transition-colors" to="#">Desserts {'>'}</Link></li>
          </ul>
        </div>

        {/* Cột 4: Newsletter */}
        <div className="lg:pr-4">
          <h3 className="text-2xl font-[800] text-black mb-8 relative inline-block">
            Newsletter
            <span className="absolute left-0 bottom-[-2px] w-[80%] h-1 bg-[#ffdb33]"></span>
          </h3>
          <p className="text-gray-700 font-semibold mb-6">
            Get recent news and updates.
          </p>
          <div className="flex flex-col gap-4 mt-2">
            <input 
              type="email" 
              placeholder="Email Address" 
              className="border border-gray-200 rounded-lg p-3.5 w-[250px] outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200 font-medium placeholder-gray-400"
            />
            <button className="bg-[#f029cc] text-white font-bold text-[15px] pt-3.5 pb-3.5 px-8 rounded-xl mt-3 w-max shadow-[0_3px_12px_rgba(240,41,204,0.4)] hover:bg-[#d81ab5] transition-all relative border border-transparent outline outline-2 outline-offset-[-2px] outline-[#f029cc] active:scale-95 group">
              <div className="absolute inset-0 rounded-xl border border-white/20"></div>
              Subscribe
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
