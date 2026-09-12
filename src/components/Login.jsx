import React, { useState } from 'react';
import { useStore } from '../store/useStore.js';
import { ShieldCheck, User, Truck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Login() {
  const loginAsUser = useStore((state) => state.loginAsUser);
  const loginAsPartner = useStore((state) => state.loginAsPartner);

  const [selectedRole, setSelectedRole] = useState('user');
  const [email, setEmail] = useState('anita.kharbangar@gmail.com');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      if (selectedRole === 'user') {
        loginAsUser({
          id: 'USR-901',
          name: email.split('@')[0].replace('.', ' '),
          email,
          role: 'user',
          verifiedWithGoogle: true,
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
        });
      } else {
        loginAsPartner({
          id: 'PTR-402',
          name: 'Damehi Mukhim (Partner)',
          email,
          role: 'partner',
          vehicleId: 'VN-002',
          verifiedWithGoogle: true,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        });
      }
    }, 600);
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-6 text-white">
      <div className="w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-200 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-md">
            N
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-wide">Neural Nexus Platform</h1>
          <p className="text-xs text-slate-500 font-semibold">North East Smart Logistics & Accessibility Intelligence</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-3 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setSelectedRole('user')}
            className={`py-2 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
              selectedRole === 'user'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="h-4 w-4 text-indigo-600" />
            <span>Login as User</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('partner')}
            className={`py-2 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
              selectedRole === 'partner'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Truck className="h-4 w-4 text-emerald-600" />
            <span>Login as Partner</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              {selectedRole === 'user' ? 'User Email Address' : 'Partner Transporter Email'}
            </label>
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs font-semibold rounded-lg border-slate-300 bg-slate-50 p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Google Verification Simulation Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2 text-xs text-emerald-800 font-semibold">
            <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <div>
              <div className="font-extrabold text-emerald-900 flex items-center gap-1">
                <span>Google Account Verification</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 inline" />
              </div>
              <div className="text-[10px] text-emerald-700">Verified OAuth SSO Token Active</div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <span>{isVerifying ? 'Authenticating with Google...' : `Continue to ${selectedRole === 'user' ? 'User Portal' : 'Partner Dashboard'}`}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-3">
          SIH 2026 Prototype &bull; Secure Encrypted Authentication
        </div>
      </div>
    </div>
  );
}
