import os
import json
import random
import uuid
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client, Client

# تحميل الإعدادات (تأكد من تعديل الاسم في ملف .env ليصبح SUPABASE_URL)
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# قوائم لتوليد أسماء أردنية واقعية
FIRST_NAMES = ["أحمد", "محمد", "عمر", "محمود", "علي", "سارة", "فاطمة", "نور", "ليلى", "تالا", "طارق", "رامي"]
LAST_NAMES = ["الخالدي", "المجالي", "الزعبي", "النعيمات", "الحداد", "المصري", "العمر", "الشامي", "العتوم", "الطراونة"]

def generate_jordanian_profile():
    """توليد بيانات شخصية وهمية واقعية"""
    full_name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
    # توليد رقم هاتف أردني (079, 078, 077)
    prefix = random.choice(["079", "078", "077"])
    phone_number = f"{prefix}{random.randint(1000000, 9999999)}"
    # رقم وطني من 10 خانات
    national_id = str(random.randint(1000000000, 2000000000))
    email = f"user_{national_id}@example.com"
    user_id = str(uuid.uuid4()) # إنشاء ID فريد
    
    return {
        "id": user_id,
        "full_name": full_name,
        "phone_number": phone_number,
        "national_id": national_id,
        "email": email
    }

def generate_financial_data(profile_type):
    """توليد سلوك مالي (ممتاز، متوسط، ضعيف)"""
    data = {"alternative_data": {}}
    
    # محاكاة فواتير "إي فواتيركم"
    bills = []
    bill_count = random.randint(3, 6)
    for i in range(bill_count):
        if profile_type == "excellent":
            status = "On-time"
        elif profile_type == "poor":
            status = random.choice(["Late", "Late", "On-time"]) # احتمالية التأخير عالية
        else:
            status = random.choice(["On-time", "On-time", "Late"])
            
        bills.append({
            "biller": random.choice(["Zain", "Orange", "Electricity", "Water"]),
            "amount_jod": random.randint(15, 60),
            "status": status,
            "month": f"2026-0{random.randint(1, 5)}"
        })
    data["alternative_data"]["bill_payments"] = bills

    # محاكاة حوالات "كليك" أو محافظ (زين كاش / أورانج موني)
    transfers = []
    transfer_count = random.randint(2, 5)
    for i in range(transfer_count):
        if profile_type == "excellent":
            amount = random.randint(300, 600) # دخل ثابت وعالي
        elif profile_type == "poor":
            amount = random.randint(50, 150)  # دخل متذبذب
        else:
            amount = random.randint(150, 350)
            
        transfers.append({
            "source": random.choice(["CliQ Transfer", "ZainCash Deposit"]),
            "amount_jod": amount,
            "date": f"2026-0{random.randint(1, 5)}-15"
        })
    data["alternative_data"]["income_transfers"] = transfers
    
    return data

def setup_mock_data(num_users=5):
    """العملية الرئيسية: رفع لـ Supabase وإنشاء ملفات JSON"""
    if not os.path.exists("data"):
        os.makedirs("data")
        
    print(f"🚀 Starting generation of {num_users} mock profiles...\n")
    
    for i in range(1, num_users + 1):
        # 1. تحديد نوع المستخدم عشوائياً
        profile_type = random.choice(["excellent", "average", "poor"])
        
        # 2. توليد البيانات الشخصية
        profile_data = generate_jordanian_profile()
        user_id = profile_data["id"]
        
        try:
            # 3. حفظ المستخدم في جدول profiles في Supabase
            # ملاحظة: إذا كان جدول profiles مربوط بـ auth.users، يجب إزالة الربط مؤقتاً لتسهيل التوليد الوهمي
            supabase.table("profiles").insert(profile_data).execute()
            print(f"✅ Created Profile in DB: {profile_data['full_name']} ({profile_type})")
        except Exception as e:
            print(f"❌ Error inserting {profile_data['full_name']} to DB. Skipping. Error: {e}")
            continue

        # 4. توليد البيانات المالية وربطها بالـ ID
        financial_data = generate_financial_data(profile_type)
        
        # إضافة البيانات الشخصية داخل الـ JSON لكي يقرأها ai_engine
        full_json_record = {
            "user_id": user_id,
            "name": profile_data["full_name"],
            "profile_type": profile_type,
            **financial_data
        }
        
        # 5. حفظ الملف في مجلد data
        filename = f"data/user_gen_{i}_{profile_type}.json"
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(full_json_record, f, ensure_ascii=False, indent=4)
            
    print("\n🎉 Mock data generation complete! Files saved in 'data' folder.")

if __name__ == "__main__":
    # تنظيف المجلد من الملفات القديمة
    for f in os.listdir("data"):
        os.remove(os.path.join("data", f))
        
    # توليد 10 مستخدمين جدد (يمكنك تغيير الرقم)
    setup_mock_data(10)