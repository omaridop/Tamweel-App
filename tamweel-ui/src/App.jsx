// src/App.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Smartphone, Building } from 'lucide-react';
import BorrowerFlow from './BorrowerFlow';
import AdminDashboard from './AdminDashboard';

export default function App() {
  const [userRole, setUserRole] = useState(null); // 'admin' or 'borrower'

  if (userRole === 'borrower') return <BorrowerFlow onLogout={() => setUserRole(null)} />;
  if (userRole === 'admin') return <AdminDashboard onLogout={() => setUserRole(null)} />;

  return (
    <div className="min-h-screen bg-[#0D2137] flex items-center justify-center p-4 font-sans" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0F2A3F] p-10 rounded-3xl w-full max-w-md shadow-[0_0_40px_rgba(2,128,144,0.1)] border border-[#7A9BB5]/10 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-[#028090] to-[#02C39A] rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg">
           <ShieldCheck className="text-[#0D2137]" size={40} />
        </div>
        <h1 className="text-4xl font-black text-[#E8F4F8] tracking-widest mb-2">TAMWEEL</h1>
        <p className="text-[#7A9BB5] text-sm mb-10 font-medium">الجيل القادم من الشمول المالي</p>

        <div className="space-y-4">
          <button onClick={() => setUserRole('borrower')} className="w-full bg-[#0D2137] border-2 border-[#028090]/50 text-[#02C39A] py-4 rounded-xl font-bold text-lg hover:bg-[#028090]/10 transition-all flex justify-center items-center gap-3">
            <Smartphone size={24} /> محاكاة تطبيق العميل
          </button>
          
          <button onClick={() => setUserRole('admin')} className="w-full bg-[#028090] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#028090]/80 transition-all shadow-[0_0_15px_#02809088] flex justify-center items-center gap-3">
            <Building size={24} /> لوحة تحكم المستثمرين
          </button>
        </div>
      </motion.div>
    </div>
  );
}