// src/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, UserSearch, MessageSquare, LogOut, ShieldCheck, 
  ArrowUpRight, ArrowDownRight, Download, CheckCircle2, Clock,
  Activity, X, FileText, Lock, CheckCircle, XCircle, Send, AlertOctagon, User, Phone, Mail, Loader2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell 
} from 'recharts';
import axios from 'axios'; 
import { getFraudRisk } from './nexusLogic';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://vabueeiboxptywfpwqrf.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_uzABAei2qkOViABMFPK1uQ_rMqNvrPM';
const API_URL = import.meta.env.VITE_API_URL || 'https://striving-candied-lettuce.ngrok-free.dev';

const supabaseHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

const scoreDistributionData = [
  { name: '0-50 (عالي المخاطر)', users: 15, color: '#ef4444' }, 
  { name: '51-70 (مقبول)', users: 35, color: '#f59e0b' },      
  { name: '71-85 (جيد)', users: 50, color: '#10b981' },        
  { name: '86-100 (ممتاز)', users: 20, color: '#059669' },     
];

const recentActivities = [
  { id: 'TML-8902', name: 'أحمد محمود', score: 88, amount: '450 JOD', status: 'approved' },
  { id: 'TML-8901', name: 'سارة خالد', score: 65, amount: '1,200 JOD', status: 'pending' },
  { id: 'TML-8900', name: 'عمر ياسين', score: 42, amount: '300 JOD', status: 'rejected' },
];

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // 🚀 حالات الشات الجديدة
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]); 
  const [isAiTyping, setIsAiTyping] = useState(false); 

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const profilesRes = await axios.get(`${SUPABASE_URL}/rest/v1/profiles?select=*`, { headers: supabaseHeaders });
        const resultsRes = await axios.get(`${SUPABASE_URL}/rest/v1/tamweel_results?select=*`, { headers: supabaseHeaders });
        const mergedData = profilesRes.data.map(profile => {
          const clientResult = resultsRes.data.find(r => r.user_id === profile.id);
          return { ...profile, tamweel_results: clientResult ? [clientResult] : [] };
        });
        setClients(mergedData);
      } catch (e) { console.error(e); }
    };
    fetchClients();
  }, []);

  function getTamweelResult(client) { return client?.tamweel_results?.[0] || null; }
  
  function getRiskLevel(client) {
    const res = getTamweelResult(client);
    if (!res) return 'قيد المراجعة';
    if (res.decision === 'Approved') return 'مؤهل';
    if (res.decision === 'Rejected') return 'خطر';
    if (res.decision === 'Conditional Approval' || res.decision === 'Manual Review') return 'تدقيق';
    return res.risk_level || 'قيد المراجعة';
  }

  const filteredClients = clients.filter(c => {
     const q = searchQuery.toLowerCase();
     return c.full_name?.toLowerCase().includes(q) || c.national_id?.includes(q) || c.phone_number?.includes(q);
  });

  // 🚀 التعديل السحري: دمج الداتا من الـ Supabase مع محاكاة الـ LocalStorage
  const baseApps = clients.length;
  const extraApps = parseInt(localStorage.getItem('tamweel_demo_apps') || '0');
  const totalApps = baseApps + extraApps;

  const acceptedClients = clients.filter(c => getRiskLevel(c) === 'مؤهل');
  const riskCases = clients.filter(c => getRiskLevel(c) === 'خطر').length;
  
  const baseFunded = acceptedClients.length * 300; 
  const extraFunded = parseInt(localStorage.getItem('tamweel_demo_funded') || '0');
  const totalFunded = baseFunded + extraFunded;

  const avgScore = acceptedClients.length > 0 
      ? Math.round(acceptedClients.reduce((acc, c) => acc + (getTamweelResult(c)?.credit_score || 0), 0) / acceptedClients.length)
      : 0;

  const handleStatusOverride = async (newRiskLevel) => {
    const resultData = getTamweelResult(selectedClient);
    if (!resultData?.id) return alert('هذا العميل لم يحلل بعد');
    setIsUpdating(true);
    let newDecision = newRiskLevel === 'مؤهل' ? 'Approved' : newRiskLevel === 'تدقيق' ? 'Conditional Approval' : 'Rejected';
    try {
      await axios.patch(`${SUPABASE_URL}/rest/v1/tamweel_results?id=eq.${resultData.id}`, { risk_level: newRiskLevel, decision: newDecision }, { headers: supabaseHeaders });
      setClients(prev => prev.map(c => c.id === selectedClient.id ? { ...c, tamweel_results: [{ ...resultData, risk_level: newRiskLevel, decision: newDecision }] } : c));
      setSelectedClient(prev => ({ ...prev, tamweel_results: [{ ...resultData, risk_level: newRiskLevel, decision: newDecision }] }));
    } finally { setIsUpdating(false); }
  };

  const handleAnalyze = async () => {
    if (!chatInput.trim()) return;

    const userQuestion = chatInput;
    setChatInput(''); 
    
    setChatHistory(prev => [...prev, { role: 'user', content: userQuestion }]);
    setIsAiTyping(true); 

    const foundClient = clients.find(c => c.full_name?.toLowerCase().includes(userQuestion.toLowerCase()));
    
    try {
      const res = await axios.post(`${API_URL}/api/chat`, { question: userQuestion, customer_data: foundClient || clients }, { headers: { 'ngrok-skip-browser-warning': 'true' } });
      
      setChatHistory(prev => [...prev, { role: 'ai', content: res.data.answer || res.data.result }]);
    } catch (e) { 
      setChatHistory(prev => [...prev, { role: 'ai', content: "❌ فشل الاتصال. تأكد من تشغيل سيرفر البايثون ورابط Ngrok." }]);
    } finally {
      setIsAiTyping(false); 
    }
  };

  return (
    <div className="flex h-screen bg-[#0B1727] text-slate-200 font-sans overflow-hidden" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      
      {/* Modal View for Override */}
      <AnimatePresence>
        {selectedClient && (
          <div className="fixed inset-0 bg-[#0B1727]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedClient(null)}>
            <div className="bg-[#132B45] border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-[#0f1f33] rounded-t-3xl">
                <div>
                   <h2 className="text-2xl font-bold text-white">{selectedClient.full_name}</h2>
                   <p className="text-slate-400 font-mono text-sm mt-1">ID: {selectedClient.national_id}</p>
                </div>
                <button onClick={() => setSelectedClient(null)} className="text-red-400 hover:text-red-300"><X size={24} /></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                 
                 <div className="flex gap-4">
                    <div className="bg-[#0f1f33] p-4 rounded-xl border border-slate-700/50 flex-1 flex items-center gap-3">
                      <Phone size={18} className="text-slate-400" /> <span className="text-white font-mono text-sm">{selectedClient.phone_number || 'غير متوفر'}</span>
                    </div>
                    <div className="bg-[#0f1f33] p-4 rounded-xl border border-slate-700/50 flex-1 flex items-center gap-3">
                      <Mail size={18} className="text-slate-400" /> <span className="text-white text-sm truncate">{selectedClient.email || 'غير متوفر'}</span>
                    </div>
                 </div>

                 {(() => {
                    const fraud = getFraudRisk(getTamweelResult(selectedClient)?.credit_score || 0);
                    return (
                        <div className={`${fraud.bg} ${fraud.color} p-4 rounded-xl border border-current flex flex-col gap-2`}>
                            <div className="flex items-center gap-2 font-bold"><ShieldCheck size={18}/> درع الاحتيال: {fraud.status}</div>
                            <div className="flex gap-2 flex-wrap">
                                {fraud.flags.map((f, i) => <span key={i} className="text-xs bg-black/20 px-2 py-1 rounded">{f}</span>)}
                            </div>
                        </div>
                    );
                 })()}

                 {getTamweelResult(selectedClient) ? (
                    <div className="grid grid-cols-3 gap-4 bg-[#0f1f33] p-6 rounded-2xl border border-slate-700/50">
                       <div><p className="text-xs text-slate-400">السكور</p><p className="text-2xl font-black text-white">{getTamweelResult(selectedClient).credit_score}/100</p></div>
                       <div><p className="text-xs text-slate-400">المبلغ</p><p className="text-2xl font-black text-emerald-400">{getTamweelResult(selectedClient).approved_amount}</p></div>
                       <div><p className="text-xs text-slate-400">الحالة</p><p className="text-xl font-black text-emerald-400">{getRiskLevel(selectedClient)}</p></div>
                       <div className="col-span-3 pt-4 border-t border-slate-700/50"><p className="text-xs text-slate-400 mb-1">السبب الائتماني:</p><p className="text-sm text-slate-200">{getTamweelResult(selectedClient).reason_arabic}</p></div>
                    </div>
                 ) : <p className="text-center text-slate-400 py-4">لم يتم تقييم العميل بعد.</p>}

                 <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
                    <p className="text-sm font-bold mb-3 flex items-center gap-2 text-white"><Lock size={16} className="text-red-400"/> تجاوز القرار (Admin Override)</p>
                    <div className="flex gap-2">
                       <button onClick={() => handleStatusOverride('مؤهل')} disabled={isUpdating} className="flex-1 bg-emerald-500/10 text-emerald-400 py-2.5 rounded-lg font-bold hover:bg-emerald-500 hover:text-white transition-colors">مؤهل</button>
                       <button onClick={() => handleStatusOverride('تدقيق')} disabled={isUpdating} className="flex-1 bg-amber-500/10 text-amber-400 py-2.5 rounded-lg font-bold hover:bg-amber-500 hover:text-white transition-colors">تدقيق</button>
                       <button onClick={() => handleStatusOverride('خطر')} disabled={isUpdating} className="flex-1 bg-red-500/10 text-red-400 py-2.5 rounded-lg font-bold hover:bg-red-500 hover:text-white transition-colors">خطر</button>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <aside className="w-72 bg-[#132B45] border-l border-slate-700/50 p-6 flex flex-col gap-8 shadow-2xl z-10">
        <div className="flex items-center gap-3 px-2">
          <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30">
            <ShieldCheck className="text-emerald-400" size={28} />
          </div>
          <h1 className="text-2xl font-black tracking-widest text-white">TAMWEEL</h1>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1 mt-4">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'نظرة عامة للمحفظة' },
            { id: 'clients', icon: UserSearch, label: 'قاعدة المقترضين' },
            { id: 'ai-engine', icon: MessageSquare, label: 'مراقب المخاطر (AI)' }
          ].map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <item.icon size={20} /> <span className="font-bold">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <button onClick={onLogout} className="flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors mt-auto">
          <LogOut size={20} /> <span className="font-bold">تسجيل الخروج</span>
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto relative bg-gradient-to-br from-[#0B1727] to-[#0f1f33] custom-scrollbar">
        
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black text-white">لوحة المستثمرين الاستراتيجية</h2>
            <p className="text-slate-400 mt-2 font-medium">نظرة تحليلية شاملة للمحفظة الائتمانية وأداء الذكاء الاصطناعي.</p>
          </div>
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-sm">
            <Download size={18} />
            تصدير التقرير (PDF)
          </button>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[#132B45] p-6 rounded-2xl border border-emerald-500/20 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500"></div>
                <div className="flex justify-between items-start">
                  <p className="text-slate-400 text-sm font-bold">التمويل المصروف</p>
                  <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded-full">
                    <ArrowUpRight size={14} /> +8.4%
                  </span>
                </div>
                <h3 className="text-3xl font-black text-emerald-400 mt-4 tracking-tight">{totalFunded} <span className="text-lg text-emerald-500/70">JOD</span></h3>
              </div>

              <div className="bg-[#132B45] p-6 rounded-2xl border border-amber-500/20 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1 h-full bg-amber-500"></div>
                <div className="flex justify-between items-start">
                  <p className="text-slate-400 text-sm font-bold">معدل التعثر (Default Risk)</p>
                  <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded-full">
                    <ArrowDownRight size={14} /> -0.3%
                  </span>
                </div>
                <h3 className="text-3xl font-black text-amber-400 mt-4 tracking-tight">1.2<span className="text-lg text-amber-500/70">%</span></h3>
                <p className="text-xs text-amber-500/60 mt-1">ضمن النطاق الآمن (أقل من 3%)</p>
              </div>

              <div className="bg-[#132B45] p-6 rounded-2xl border border-slate-700 shadow-lg">
                <div className="flex justify-between items-start">
                  <p className="text-slate-400 text-sm font-bold">متوسط السكور الائتماني</p>
                  <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded-full">
                    <ArrowUpRight size={14} /> +2 نقطة
                  </span>
                </div>
                <h3 className="text-3xl font-black text-white mt-4 tracking-tight">{avgScore}<span className="text-lg text-slate-500">/100</span></h3>
              </div>

              <div className="bg-[#132B45] p-6 rounded-2xl border border-slate-700 shadow-lg">
                <div className="flex justify-between items-start">
                  <p className="text-slate-400 text-sm font-bold">إجمالي الطلبات (الشهر الحالي)</p>
                  <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded-full">
                    <ArrowUpRight size={14} /> +12%
                  </span>
                </div>
                <h3 className="text-3xl font-black text-white mt-4 tracking-tight">{totalApps}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[#132B45] p-6 rounded-3xl border border-slate-700 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6">توزيع الجدارة الائتمانية للعملاء (Score Distribution)</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreDistributionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        cursor={{fill: '#1e293b'}} 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', textAlign: 'right' }} 
                        itemStyle={{ fontWeight: 'bold' }} 
                      />
                      <Bar dataKey="users" radius={[4, 4, 0, 0]} maxBarSize={50}>
                        {scoreDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[#132B45] p-6 rounded-3xl border border-slate-700 shadow-xl flex flex-col">
                <h3 className="text-lg font-bold text-white mb-6">أحدث الطلبات (Live Feed)</h3>
                <div className="space-y-4 flex-1">
                  {recentActivities.map((activity, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-white">{activity.name}</span>
                        <span className="text-xs text-slate-400 font-mono">{activity.id} | السكور: {activity.score}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-black text-slate-200">{activity.amount}</span>
                        {activity.status === 'approved' && <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded"><CheckCircle2 size={12}/> تمت الموافقة</span>}
                        {activity.status === 'pending' && <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded"><Clock size={12}/> قيد التدقيق</span>}
                        {activity.status === 'rejected' && <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded"><ShieldCheck size={12}/> مرفوض أمنياً</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-3 text-sm text-emerald-400 font-bold hover:bg-emerald-400/5 rounded-xl transition-colors border border-dashed border-emerald-400/30">
                  عرض جميع الطلبات
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Clients Database */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div className="bg-[#132B45] p-6 rounded-3xl border border-slate-700 shadow-xl">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="font-bold text-2xl flex items-center gap-3 text-white"><UserSearch className="text-emerald-400" size={28} /> قاعدة بيانات المقترضين</h3>
                   <input type="text" placeholder="بحث بالاسم، الرقم الوطني، أو الهاتف..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-96 bg-[#0f1f33] border border-slate-700 p-3 rounded-xl outline-none focus:border-emerald-500 text-sm text-white transition-all shadow-inner" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredClients.map((client, idx) => {
                    const risk = getRiskLevel(client);
                    return (
                    <div key={client.id || idx} onClick={() => setSelectedClient(client)} className="bg-[#0f1f33] p-6 rounded-2xl border border-slate-700/50 hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all shadow-lg cursor-pointer group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-300 font-black group-hover:bg-emerald-500 group-hover:text-white transition-colors">{idx + 1}</div>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${risk === 'مؤهل' ? 'bg-emerald-500/10 text-emerald-400' : risk === 'خطر' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {risk}
                        </span>
                    </div>
                    <p className="font-bold text-lg text-white">{client.full_name || 'Anonymous'}</p>
                    <p className="text-xs text-slate-400 mt-1 truncate">{client.email}</p>
                    <p className="text-[10px] text-emerald-400 font-bold mt-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">انقر للتفاصيل <ArrowUpRight size={12}/></p>
                    </div>
                )})}
                </div>
            </div>
          </div>
        )}

        {/* TAB 3: AI Engine */}
        {activeTab === 'ai-engine' && (
          <div className="bg-[#132B45] rounded-3xl border border-slate-700 flex flex-col h-[650px] shadow-xl overflow-hidden">
             <div className="p-6 border-b border-slate-700/50 bg-[#0f1f33] flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <MessageSquare className="text-emerald-400" size={24} />
                   <h3 className="font-bold text-xl text-white">مراقب المخاطر الاستراتيجي (AI Copilot)</h3>
                </div>
             </div>
             
            <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-[#0B1727]/50 custom-scrollbar flex flex-col">
              {chatHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-6 opacity-50 my-auto">
                   <ShieldCheck size={80} className="animate-pulse" />
                   <p className="text-xl font-medium">بانتظار الاستفسارات والتحليلات الاستراتيجية...</p>
                </div>
              ) : (
                chatHistory.map((msg, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
                  >
                    <span className="text-xs text-slate-500 mb-1 px-2">{msg.role === 'user' ? 'أنت (المدير)' : 'Nexus AI'}</span>
                    <div className={`p-5 rounded-2xl shadow-md whitespace-pre-wrap leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-[#0f1f33] border border-slate-600 text-slate-200 rounded-tl-none' 
                        : 'bg-[#132B45] border-r-4 border-emerald-500 text-emerald-50 rounded-tr-none'
                    }`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))
              )}
              
              {isAiTyping && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="self-start flex flex-col items-start max-w-[85%]">
                    <span className="text-xs text-slate-500 mb-1 px-2">Nexus AI</span>
                    <div className="p-4 rounded-2xl bg-[#132B45] border-r-4 border-emerald-500 text-emerald-400 rounded-tr-none flex gap-2 items-center shadow-md">
                       <Loader2 className="animate-spin" size={18} /> جاري تحليل البيانات وصياغة القرار...
                    </div>
                 </motion.div>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-700/50 bg-[#0f1f33]">
              <div className="relative max-w-4xl mx-auto flex gap-3">
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && !isAiTyping && handleAnalyze()} 
                  disabled={isAiTyping}
                  className="flex-1 bg-[#0B1727] border border-slate-700 rounded-xl py-4 px-6 text-white outline-none focus:border-emerald-500 transition-all shadow-inner disabled:opacity-50" 
                  placeholder="اسأل المحرك الذكي (مثال: اشرح لي سبب رفض العميل رقم 3؟)" 
                />
                <button 
                  onClick={handleAnalyze} 
                  disabled={isAiTyping || !chatInput.trim()}
                  className="bg-emerald-500 px-6 rounded-xl hover:bg-emerald-400 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center"
                >
                  <Send className="text-white" size={24} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}