// src/BorrowerFlow.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle2, Activity, LogOut, Loader2, Info, User, Briefcase, Car, Home, Wallet, Building, AlertTriangle, Smartphone, FileText, Lock } from 'lucide-react';
import { calculateInstallment, calculateDynamicScore, getAiRecommendation, generateExplainability } from './nexusLogic';

export default function BorrowerFlow({ onLogout }) {
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScanning, setIsScanning] = useState(false); // 🚀 حالة السحب التلقائي الجديدة

  // User Profile State
  const [persona, setPersona] = useState('');
  const [dataSources, setDataSources] = useState([]);
  const [income, setIncome] = useState('');
  const [transfers, setTransfers] = useState('');
  const [latePayments, setLatePayments] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [months, setMonths] = useState(3);
  const [cbjConsent, setCbjConsent] = useState(false);

  // Dynamic Results
  const [finalScore, setFinalScore] = useState(0);

  const toggleSource = (source) => {
    if (dataSources.includes(source)) setDataSources(dataSources.filter(s => s !== source));
    else setDataSources([...dataSources, source]);
  };

  // 🚀 دالة السحب الوهمي (تعبئة الأرقام تلقائياً)
  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      // تعبئة تلقائية لإبهار اللجنة
      setIncome('450');
      setTransfers('5');
      setLatePayments('0');
      setIsScanning(false);
      setStep(3);
    }, 2000);
  };

  const handleApply = (e) => {
    e.preventDefault();
    if (!cbjConsent) return alert('يجب الموافقة على الشروط!');
    if (dataSources.length === 0) return alert('الرجاء اختيار مصدر بيانات مالي واحد على الأقل.');
    
    // حساب السكور الديناميكي
    const calculatedScore = calculateDynamicScore(Number(income), Number(latePayments), dataSources.length);
    setFinalScore(calculatedScore);

    setStep(5); // الانتقال للتحليل
    setTimeout(() => setStep(6), 3500);
  };

  // 🚀 دالة إنهاء العرض وإرسال الداتا للداشبورد (Live Sync)
  const handleCompleteDemo = () => {
    // زيادة عدد الطلبات الإجمالي في الذاكرة
    const currentApps = parseInt(localStorage.getItem('tamweel_demo_apps') || '0');
    localStorage.setItem('tamweel_demo_apps', currentApps + 1);

    // إذا تمت الموافقة، نزيد مبلغ التمويل المصروف
    if (finalScore >= 50 && loanAmount) {
        const currentExtraFunded = parseInt(localStorage.getItem('tamweel_demo_funded') || '0');
        localStorage.setItem('tamweel_demo_funded', currentExtraFunded + Number(loanAmount));
    }
    
    onLogout(); // العودة للرئيسية
  };

  const currentInstallment = calculateInstallment(loanAmount || 300, months);
  const aiRec = getAiRecommendation(Number(income || 300), currentInstallment, months);

  return (
    <div className="min-h-screen bg-[#0D2137] text-[#E8F4F8] p-4 font-sans flex flex-col" dir="rtl">
      <header className="max-w-3xl mx-auto w-full flex justify-between items-center bg-[#0F2A3F] p-4 rounded-2xl border border-[#7A9BB5]/20 shadow-lg mt-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#028090] p-2 rounded-lg"><ShieldCheck size={24} /></div>
          <div><h2 className="font-bold tracking-wider">TAMWEEL APP</h2><p className="text-xs text-[#02C39A]">الهوية المالية الرقمية</p></div>
        </div>
        <button onClick={onLogout} className="text-[#E84855] hover:bg-[#E84855]/10 p-2 rounded-lg transition-all"><LogOut size={20} /></button>
      </header>

      {/* Progress Tracker */}
      <div className="max-w-3xl mx-auto w-full flex justify-between items-center mt-8 px-4 relative">
         <div className="absolute top-1/2 right-0 left-0 h-1 bg-[#7A9BB5]/20 -z-10 transform -translate-y-1/2 rounded-full"></div>
         <div className={`absolute top-1/2 right-0 h-1 bg-[#02C39A] -z-10 transform -translate-y-1/2 rounded-full transition-all duration-500`} style={{ width: `${((step - 1) / 5) * 100}%` }}></div>
         {['البروفايل', 'المصادر', 'المالية', 'التمويل', 'التحليل', 'القرار'].map((label, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${step > i ? 'bg-[#02C39A] text-[#0D2137]' : step === i + 1 ? 'bg-[#028090] text-white border-4 border-[#0D2137]' : 'bg-[#0F2A3F] text-[#7A9BB5] border-2 border-[#7A9BB5]/20'}`}>
                  {step > i ? <CheckCircle2 size={16} /> : i + 1}
               </div>
               <span className={`text-[10px] font-bold ${step >= i + 1 ? 'text-[#02C39A]' : 'text-[#7A9BB5]'}`}>{label}</span>
            </div>
         ))}
      </div>

      <div className="max-w-2xl mx-auto w-full mt-10 flex-1">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Persona */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="bg-[#0F2A3F] p-8 rounded-3xl border border-[#7A9BB5]/20 shadow-xl">
              <h3 className="text-2xl font-bold mb-2">من أنت؟</h3>
              <p className="text-[#7A9BB5] text-sm mb-6">اختر طبيعة عملك لنتمكن من تخصيص نموذج المخاطر الخاص بك.</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                    { id: 'freelance', label: 'عمل حر / فريلانسر', icon: Briefcase },
                    { id: 'home', label: 'صاحب مشروع منزلي', icon: Home },
                    { id: 'driver', label: 'سائق تطبيقات', icon: Car },
                    { id: 'employee', label: 'موظف + دخل إضافي', icon: User }
                ].map(p => (
                  <button key={p.id} onClick={() => setPersona(p.id)} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${persona === p.id ? 'border-[#02C39A] bg-[#02C39A]/10 text-[#02C39A]' : 'border-[#7A9BB5]/20 text-[#7A9BB5] hover:border-[#028090]/50'}`}>
                    <p.icon size={30} /> <span className="font-bold text-sm">{p.label}</span>
                  </button>
                ))}
              </div>
              <button disabled={!persona} onClick={() => setStep(2)} className="w-full mt-8 bg-[#028090] text-white py-4 rounded-xl font-bold disabled:opacity-50 hover:bg-[#028090]/80">التالي</button>
            </motion.div>
          )}

          {/* STEP 2: Data Sources */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="bg-[#0F2A3F] p-8 rounded-3xl border border-[#7A9BB5]/20 shadow-xl">
              <h3 className="text-2xl font-bold mb-2">مصادر الدخل الموثقة</h3>
              <p className="text-[#7A9BB5] text-sm mb-6">اختر المحافظ أو الحسابات التي تستلم عليها دخلك لزيادة دقة تقييمك الائتماني.</p>
              
              <div className="space-y-3">
                {[
                    { id: 'cliq', label: 'محفظة CliQ', icon: Smartphone, hint: '+15% دقة سكور' },
                    { id: 'zain', label: 'ZainCash / Orange', icon: Wallet, hint: '+10% دقة سكور' },
                    { id: 'bank', label: 'حساب بنكي (Open Banking)', icon: Building, hint: '+25% دقة سكور' },
                    { id: 'manual', label: 'إيصال دخل يدوي', icon: FileText, hint: 'يتطلب تدقيق بشري' }
                ].map(s => (
                  <button key={s.id} onClick={() => toggleSource(s.id)} className={`w-full p-4 rounded-xl border-2 flex justify-between items-center transition-all ${dataSources.includes(s.id) ? 'border-[#02C39A] bg-[#02C39A]/10 text-[#02C39A]' : 'border-[#7A9BB5]/20 text-[#7A9BB5] hover:border-[#028090]/50'}`}>
                    <div className="flex items-center gap-3">
                       <s.icon size={20} /> 
                       <span className="font-bold">{s.label}</span>
                       <span className="text-[10px] bg-[#0D2137] px-2 py-1 rounded text-[#02C39A] mr-2 border border-[#02C39A]/30">{s.hint}</span>
                    </div>
                    {dataSources.includes(s.id) && (
                       <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 text-xs font-bold text-[#02C39A]">
                          <span>تم الربط</span>
                          <CheckCircle2 size={18} />
                       </motion.div>
                    )}
                  </button>
                ))}
              </div>

              {/* 🚀 ختم الأمان (Trust Badge) */}
              <div className="mt-6 flex items-center justify-center gap-2 text-[#7A9BB5] text-[11px] bg-[#0D2137] p-3 rounded-xl border border-[#7A9BB5]/10">
                 <Lock size={16} className="text-[#02C39A] shrink-0" />
                 <span>بياناتك مشفرة بالكامل ومتوافقة مع معايير البنك المركزي الأردني (Open Banking).</span>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(1)} className="flex-1 bg-[#0D2137] border border-[#7A9BB5]/30 text-[#7A9BB5] py-4 rounded-xl font-bold">رجوع</button>
                {/* 🚀 الزر السحري الجديد */}
                <button disabled={dataSources.length === 0 || isScanning} onClick={handleSimulateScan} className="flex-2 bg-[#028090] text-white py-4 px-4 rounded-xl font-bold disabled:opacity-50 text-sm flex items-center justify-center gap-2 hover:bg-[#028090]/80">
                  {isScanning ? <><Loader2 className="animate-spin size-5" /> جاري سحب البيانات...</> : <><Activity size={18} /> تحليل المصادر وبناء السكور</>}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Financial Snapshot */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="bg-[#0F2A3F] p-8 rounded-3xl border border-[#7A9BB5]/20 shadow-xl">
              <h3 className="text-2xl font-bold mb-2">بصمتك المالية</h3>
              
              <div className="bg-[#028090]/10 border border-[#028090]/30 p-3 rounded-xl mb-6 text-[#02C39A] text-xs flex items-start gap-2">
                 <Activity size={16} className="shrink-0 mt-0.5" />
                 <p><strong>(وضع المحاكاة للـ Demo):</strong> في النظام الحقيقي، يتم سحب هذه البيانات تلقائياً وموثقة عبر الـ API الخاص بـ (CliQ/البنوك). تم إتاحة التعديل هنا لتمكين لجنة التحكيم من اختبار سيناريوهات وخوارزميات المخاطر المختلفة.</p>
              </div>

              {/* 🚀 حقول البيانات المعبأة تلقائياً مع أختام التحقق */}
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[#7A9BB5] text-sm">متوسط الدخل الشهري الفعلي (JOD)</label>
                    <span className="text-[#02C39A] text-[10px] bg-[#02C39A]/10 px-2 py-1 rounded flex items-center gap-1"><CheckCircle2 size={12}/> تم التحقق عبر {dataSources.includes('cliq') ? 'CliQ' : 'المحفظة'}</span>
                  </div>
                  <input required type="number" value={income} onChange={(e)=>setIncome(e.target.value)} className="w-full bg-[#0D2137] border border-[#02C39A]/50 rounded-xl p-4 text-[#E8F4F8] outline-none" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[#7A9BB5] text-sm">عدد الحوالات المستلمة شهرياً</label>
                    <span className="text-[#02C39A] text-[10px] bg-[#02C39A]/10 px-2 py-1 rounded flex items-center gap-1"><CheckCircle2 size={12}/> قراءة من سجل المعاملات</span>
                  </div>
                  <input required type="number" value={transfers} onChange={(e)=>setTransfers(e.target.value)} className="w-full bg-[#0D2137] border border-[#02C39A]/50 rounded-xl p-4 text-[#E8F4F8] outline-none" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[#7A9BB5] text-sm">عدد الدفعات المتأخرة آخر 6 أشهر</label>
                    <span className="text-[#02C39A] text-[10px] bg-[#02C39A]/10 px-2 py-1 rounded flex items-center gap-1"><CheckCircle2 size={12}/> تدقيق ائتماني آمن</span>
                  </div>
                  <input required type="number" value={latePayments} onChange={(e)=>setLatePayments(e.target.value)} className="w-full bg-[#0D2137] border border-[#02C39A]/50 rounded-xl p-4 text-[#E8F4F8] outline-none" />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(2)} className="flex-1 bg-[#0D2137] border border-[#7A9BB5]/30 text-[#7A9BB5] py-4 rounded-xl font-bold">رجوع</button>
                <button disabled={!income || !transfers || latePayments===''} onClick={() => setStep(4)} className="flex-2 bg-[#028090] text-white py-4 px-8 rounded-xl font-bold disabled:opacity-50">التالي</button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Loan Structuring */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="bg-[#0F2A3F] p-8 rounded-3xl border border-[#7A9BB5]/20 shadow-xl">
              <h3 className="text-2xl font-bold mb-6">هندسة القرض الذكي</h3>
              <form onSubmit={handleApply} className="space-y-5">
                <div>
                  <label className="block text-[#7A9BB5] text-sm mb-2">نوع المنتج التمويلي</label>
                  <select required value={loanPurpose} onChange={(e)=>setLoanPurpose(e.target.value)} className="w-full bg-[#0D2137] border border-[#7A9BB5]/20 rounded-xl p-4 text-[#E8F4F8] outline-none">
                    <option value="">-- اختر الغرض --</option>
                    <option value="laptop">💻 لابتوب ومعدات عمل</option>
                    <option value="vehicle">🛵 دراجة توصيل</option>
                    <option value="cash">💸 سلفة سيولة طارئة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#7A9BB5] text-sm mb-2">المبلغ المطلوب (JOD)</label>
                  <input required type="number" min="50" max="1000" placeholder="مثال: 300" value={loanAmount} onChange={(e)=>setLoanAmount(e.target.value)} className="w-full bg-[#0D2137] border border-[#7A9BB5]/20 rounded-xl p-4 text-[#E8F4F8] outline-none" />
                </div>
                
                <div>
                   <label className="block text-[#7A9BB5] text-sm mb-2">اختر مدة السداد</label>
                   <div className="flex gap-2">
                      {[3, 6, 9, 12].map(m => (
                         <button type="button" key={m} onClick={() => setMonths(m)} className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${months === m ? 'bg-[#02C39A] border-[#02C39A] text-[#0D2137]' : 'border-[#7A9BB5]/20 text-[#7A9BB5] hover:border-[#028090]'}`}>
                            {m} أشهر
                         </button>
                      ))}
                   </div>
                </div>

                {loanAmount && (
                    <div className="bg-[#0D2137] p-4 rounded-xl border border-[#028090]/30 text-center relative overflow-hidden">
                       <p className="text-[#7A9BB5] text-xs mb-1">القسط الشهري التقديري</p>
                       <p className="text-2xl font-black text-[#E8F4F8]">{currentInstallment} JOD</p>
                       
                       {/* AI Smart Recommendation */}
                       {aiRec.hasWarning ? (
                           <div className="mt-3 p-3 bg-[#E84855]/10 border border-[#E84855]/20 rounded-lg text-xs text-[#E84855] flex items-start gap-2 text-right">
                               <AlertTriangle size={16} className="shrink-0 mt-0.5"/> <span>{aiRec.message}</span>
                           </div>
                       ) : (
                           <div className="mt-3 p-3 bg-[#02C39A]/10 border border-[#02C39A]/20 rounded-lg text-xs text-[#02C39A] flex items-start gap-2 text-right">
                               <CheckCircle2 size={16} className="shrink-0 mt-0.5"/> <span>{aiRec.message}</span>
                           </div>
                       )}
                    </div>
                )}

                <div className="bg-[#0D2137] p-4 rounded-xl border border-[#7A9BB5]/10 flex items-start gap-3 mt-4">
                  <input type="checkbox" id="consent" required checked={cbjConsent} onChange={(e)=>setCbjConsent(e.target.checked)} className="mt-1 w-5 h-5 accent-[#028090]" />
                  <label htmlFor="consent" className="text-[10px] text-[#7A9BB5] leading-relaxed cursor-pointer">أقر بتفويضي لنظام TAMWEEL باستخراج هويتي المالية الائتمانية عبر المحافظ، وأؤكد دقة بياناتي المدخلة لتحليل المخاطر حسب تعليمات البنك المركزي (CBJ).</label>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setStep(3)} className="flex-1 bg-[#0D2137] border border-[#7A9BB5]/30 text-[#7A9BB5] py-4 rounded-xl font-bold">رجوع</button>
                  <button type="submit" className="flex-2 bg-[#02C39A] text-[#0D2137] py-4 px-8 rounded-xl font-black text-lg hover:bg-[#02C39A]/90 transition-all">تحليل الائتمان 🚀</button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 5: AI Engine Processing */}
          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0F2A3F] p-12 rounded-3xl border border-[#028090]/50 text-center space-y-6 shadow-xl">
              <div className="w-24 h-24 bg-[#028090]/20 rounded-full mx-auto flex items-center justify-center"><Activity size={50} className="text-[#028090] animate-pulse" /></div>
              <h3 className="text-2xl font-bold text-[#E8F4F8]">جاري بناء هويتك المالية...</h3>
              <p className="text-[#7A9BB5] text-sm">محرك Nexus يحلل السلوك، يدمج مصادر البيانات، ويقيس القدرة على السداد.</p>
              <div className="bg-[#0D2137] p-4 rounded-xl border border-[#7A9BB5]/10 text-right space-y-2 mt-4 text-xs font-mono">
                 <p className="text-[#02C39A]">✓ ربط البيانات: مكتمل ({dataSources.length} مصادر)</p>
                 <p className="text-[#02C39A]">✓ تحليل الملاءة: DTI مستقر</p>
                 <p className="text-[#F5A623] animate-pulse">⟳ احتساب سكور الانضباط...</p>
              </div>
            </motion.div>
          )}

          {/* STEP 6: Decision & Explainability */}
          {step === 6 && (
            <motion.div key="s6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0F2A3F] p-8 rounded-3xl border-2 border-[#02C39A] shadow-[0_0_30px_rgba(2,195,154,0.1)] relative overflow-hidden">
               <div className="text-center border-b border-[#7A9BB5]/20 pb-6 mb-6">
                 <h3 className="text-2xl font-black text-[#E8F4F8] mb-2">{finalScore >= 50 ? 'تمت الموافقة المبدئية! 🎉' : 'عذراً، يتطلب مراجعة يدوية ⚠️'}</h3>
                 <p className={`text-6xl font-black mt-4 ${finalScore >= 70 ? 'text-[#02C39A]' : finalScore >= 50 ? 'text-[#F5A623]' : 'text-[#E84855]'}`}>{finalScore}<span className="text-xl text-[#7A9BB5]">/100</span></p>
                 <p className="text-xs text-[#7A9BB5] mt-2">Nexus Credit Score</p>
               </div>

               {/* Explainability Layer */}
               <div className="space-y-4">
                  <h4 className="font-bold flex items-center gap-2"><Info size={18} className="text-[#028090]"/> كيف تم بناء هذا السكور؟</h4>
                  <div className="grid grid-cols-1 gap-2">
                     {generateExplainability(finalScore).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-[#0D2137] p-3 rounded-lg border border-[#7A9BB5]/10">
                           <span className="text-sm text-[#7A9BB5]">{item.label}</span>
                           <span className={`font-bold ${item.color}`}>{item.value}</span>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="mt-6 bg-[#0D2137] p-4 rounded-xl border border-[#028090]/30 text-center">
                  <p className="text-[#7A9BB5] text-sm mb-1">التمويل المعتمد ({months} أشهر)</p>
                  <p className="text-2xl font-black text-[#E8F4F8]">{loanAmount} JOD <span className="text-sm font-normal text-[#7A9BB5]">({currentInstallment} شهرياً)</span></p>
               </div>

               {finalScore >= 50 && (
                   <div className="mt-6 bg-[#F5A623]/10 p-4 rounded-xl border border-[#F5A623]/30">
                      <p className="text-xs text-[#F5A623] font-bold leading-relaxed">🎯 خريطة النمو: حافظ على سدادك بالموعد لمدة 3 أشهر، وسيرتفع سكورك تلقائياً لزيادة الحد الائتماني المتاح لك.</p>
                   </div>
               )}

               {/* 🚀 الزر السحري اللي بيعمل Sync للداشبورد */}
               <button onClick={handleCompleteDemo} className="w-full mt-6 bg-[#02C39A] text-[#0D2137] py-4 rounded-xl font-black text-lg hover:bg-[#02C39A]/90 transition-all shadow-lg">
                   {finalScore >= 50 ? 'استكمال توقيع العقد الذكي' : 'العودة للرئيسية'}
               </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}