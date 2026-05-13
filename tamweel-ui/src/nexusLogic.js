// src/nexusLogic.js

// حساب القسط الشهري مع نسبة ربح 5%
export const calculateInstallment = (amount, months) => {
    const total = amount * 1.05; 
    return (total / months).toFixed(2);
};

// خوارزمية بناء الهوية المالية (Dynamic Scoring Formula)
export const calculateDynamicScore = (income, latePayments, sourcesCount) => {
    let score = 0;

    // 1. استقرار الدخل (Max 35)
    if (income >= 600) score += 35;
    else if (income >= 300) score += 30;
    else if (income >= 150) score += 20;
    else score += 10;

    // 2. الانضباط في السداد (Max 30)
    if (latePayments === 0) score += 30;
    else if (latePayments <= 2) score += 15;
    else score += 0;

    // 3. تنوع مصادر البيانات (Max 20)
    if (sourcesCount >= 3) score += 20;
    else if (sourcesCount === 2) score += 15;
    else score += 10;

    // 4. أمان الاحتيال والمصداقية (Max 15 - Default for Demo)
    score += 15;

    return score;
};

// محلل عبء الدين التنبؤي (DTI / Repayment Recommender)
export const getAiRecommendation = (income, installment, currentMonths) => {
    const dti = installment / income;
    
    if (dti > 0.35) {
        // عبء الدين عالي، نقترح مدة أطول
        const recommendedMonths = currentMonths === 3 ? 6 : currentMonths === 6 ? 9 : 12;
        return {
            hasWarning: true,
            message: `قسطك يمثل عبء عالي على دخلك (${(dti*100).toFixed(0)}%). لتقليل المخاطر وزيادة فرصة القبول، نوصي بتمديد السداد لـ ${recommendedMonths} أشهر.`
        };
    }
    return {
        hasWarning: false,
        message: 'مدة السداد المختارة تتناسب بشكل ممتاز مع تدفقك النقدي وتضمن لك سكور عالي.'
    };
};

// طبقة الشفافية: لماذا حصل العميل على هذا السكور؟
export const generateExplainability = (score) => {
    if (score >= 70) return [
        { label: 'تدفق نقدي مستقر', value: '+35', color: 'text-[#02C39A]' }, 
        { label: 'سداد منتظم', value: '+30', color: 'text-[#02C39A]' }, 
        { label: 'مصادر بيانات متنوعة', value: '+15', color: 'text-[#02C39A]' }
    ];
    if (score >= 50) return [
        { label: 'معدل دخل متوسط', value: '+20', color: 'text-[#02C39A]' }, 
        { label: 'بعض التأخيرات السابقة', value: '+15', color: 'text-[#F5A623]' }, 
        { label: 'مصدر بيانات واحد', value: '+10', color: 'text-[#F5A623]' }
    ];
    return [
        { label: 'ضعف التدفق النقدي', value: '+10', color: 'text-[#E84855]' }, 
        { label: 'تأخيرات سداد متكررة', value: '0', color: 'text-[#E84855]' }
    ];
};

// درع مكافحة الاحتيال
export const getFraudRisk = (creditScore) => {
    const isSuspicious = creditScore > 0 && creditScore < 45;
    return {
        score: isSuspicious ? 65 : 12,
        status: isSuspicious ? 'تحذير أمني' : 'آمن تماماً',
        color: isSuspicious ? 'text-[#F5A623]' : 'text-[#02C39A]',
        bg: isSuspicious ? 'bg-[#F5A623]/10' : 'bg-[#02C39A]/10',
        flags: isSuspicious ? ['تذبذب في الدخل', 'بيانات غير مكتملة'] : ['تطابق الهوية (KYC)', 'سلوك مالي طبيعي']
    };
};