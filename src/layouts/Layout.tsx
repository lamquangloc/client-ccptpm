import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-gray-50/20">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <Footer />
    </div>
  );
}
