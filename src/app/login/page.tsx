'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Lock, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';

import { loginAction } from '../actions';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginAction(email, password);

      if (!res.success) {
        throw new Error(res.error || 'Login failed');
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row w-full max-w-[100vw] overflow-hidden bg-[#FDFBF7]"
      style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* LEFT SIDE - Brand & Image */}
      <div className="hidden md:flex md:w-[45%] lg:w-[55%] relative flex-col justify-between p-12 overflow-hidden bg-[#1a1008]">
        {/* Background Decorative */}
        <div className="absolute top-0 right-0 w-full h-full opacity-40 mix-blend-overlay">
           <div className="absolute inset-0 bg-gradient-to-br from-[#59161a] to-[#1a1008] z-10"></div>
           <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-[#c3a165] blur-[150px] opacity-20 rounded-full"></div>
        </div>

        <div className="relative z-20">
          <Link href="/" className="flex items-center gap-3 w-fit">
            <Image src="/logo.png" alt="Κανόνας" width={50} height={50} className="w-12 h-12 brightness-0 invert opacity-90" />
            <span style={{fontFamily:"'Playfair Display', serif"}} className="font-black text-2xl tracking-widest text-white/90">ΔΕΛΤΟΣ</span>
          </Link>
        </div>

        <div className="relative z-20 max-w-xl">
          <h1 style={{fontFamily:"'Playfair Display', serif"}} className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
            Καλώς ήρθατε στο<br/>
            <span style={{background:'linear-gradient(135deg,#c3a165,#e0bc7b)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>Ψηφιακό Σύστημα</span>
          </h1>
          <p className="text-[#a89d96] text-lg leading-relaxed">
            Διαχειριστείτε τον Ιερό σας Ναό με ασφάλεια, ταχύτητα και σύγχρονα εργαλεία. 
            Mια νέα εποχή οργάνωσης.
          </p>
        </div>
        
        <div className="relative z-20 flex items-center gap-6 text-sm text-[#736760] font-medium border-t border-white/10 pt-8 mt-12 w-full">
           <div className="flex gap-2 items-center"><ShieldCheck className="w-4 h-4 text-[#c3a165]" /> Κρυπτογραφημένη Σύνδεση</div>
           <div className="flex gap-2 items-center"><ShieldCheck className="w-4 h-4 text-[#c3a165]" /> ISO 27001 Datacenters</div>
        </div>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative">
        <Link href="/" className="md:hidden absolute top-6 left-6 flex items-center gap-2">
          <Image src="/logo.png" alt="Κανόνας" width={32} height={32} className="w-8 h-8 rounded-lg shadow-sm" />
          <span style={{fontFamily:"'Playfair Display', serif"}} className="font-black text-lg tracking-widest text-[#2b1f1a]">ΔΕΛΤΟΣ</span>
        </Link>
        
        <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mb-10 text-center md:text-left pt-12 md:pt-0">
             <h2 style={{fontFamily:"'Playfair Display', serif"}} className="text-3xl font-bold text-[#2b1f1a] mb-2">Σύνδεση</h2>
             <p className="text-[#736760]">Εισάγετε τα στοιχεία του λογαριασμού σας</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50/80 border border-red-200/50 text-red-600 text-sm rounded-xl text-center flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#736760] ml-1">Email / Username</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-[#b0a09a] group-focus-within:text-[#c3a165] transition-colors" />
                <input
                  type="email"
                  placeholder="admin@churchos.gr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-[#e5dfd9] rounded-xl pl-11 pr-4 py-3.5 text-[#2b1f1a] transition-all focus:border-[#c3a165] focus:ring-4 focus:ring-[#c3a165]/10 outline-none text-base"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                 <label className="text-xs font-bold uppercase tracking-wider text-[#736760]">Κωδικος Προσβασης</label>
                 <Link href="#" className="text-xs font-semibold text-[#59161a] hover:underline">Ανάκτηση;</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-[#b0a09a] group-focus-within:text-[#c3a165] transition-colors" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-[#e5dfd9] rounded-xl pl-11 pr-4 py-3.5 text-[#2b1f1a] transition-all focus:border-[#c3a165] focus:ring-4 focus:ring-[#c3a165]/10 outline-none text-base"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-black text-white flex items-center justify-center gap-2 mt-4 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
              style={{ background: 'linear-gradient(135deg, #2b1f1a, #1a1008)' }}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Είσοδος'}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-[#e5dfd9] text-center">
             <p className="text-sm text-[#736760]">
               Δεν έχετε συνεργασία; <br className="sm:hidden" />
               <Link href="/contact" className="text-[#c3a165] font-bold hover:text-[#e0bc7b] transition-colors inline-block mt-1 sm:mt-0 sm:ml-1">Ξεκινήστε μαζί μας</Link>
             </p>
          </div>
        </div>
      </div>

    </div>
  );
}
