import json
import os
import logging
from datetime import datetime
from supabase import create_client
from dotenv import load_dotenv

# المكتبات الخاصة بالـ RAG
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
# ─── 1. إعدادات النظام وتسجيل الأخطاء (Logging) ────────────────────────
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("❌ مفاتيح Supabase غير موجودة في ملف .env!")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ─── 2. إعدادات الموديل (Embeddings) ────────────────────────────────────
# استخدام الموديل المجاني والسريع (ينتج متجهات بحجم 384)
embeddings_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# ─── 3. إعدادات التقطيع الذكي (Advanced Semantic Chunking) ──────────────
# السر هنا: أولوية القطع للفقرات، ثم النقطة، ثم الفاصلة العربية، ثم المسافة
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=75, # زيادة التداخل لضمان عدم ضياع أي سياق قانوني
    separators=["\n\n", "\n", ".", "،", " ", ""] 
)

BATCH_SIZE = 50 # عدد المقاطع التي يتم رفعها دفعة واحدة (تسريع هائل وتفادي أخطاء الشبكة)

def clean_text(text: str) -> str:
    """تنظيف النص من الرموز البرمجية لتحسين فهم الذكاء الاصطناعي (Sanitization)"""
    # إزالة أقواس الـ JSON وعلامات التنصيص الزائدة
    cleaned = text.replace("{", "").replace("}", "").replace('"', '').replace('[', '').replace(']', '')
    # إزالة المسافات المزدوجة
    return " ".join(cleaned.split())

def ingest_json_files(folder_path="knowledge_base"):
    if not os.path.exists(folder_path):
        logger.error(f"❌ المجلد {folder_path} غير موجود!")
        return

    json_files = [f for f in os.listdir(folder_path) if f.endswith(".json")]
    if not json_files:
        logger.warning("⚠️ لا يوجد ملفات JSON في المجلد.")
        return

    logger.info(f"🚀 بدء معالجة {len(json_files)} ملفات باستخدام خوارزميات RAG المتقدمة...")

    for filename in json_files:
        file_path = os.path.join(folder_path, filename)
        logger.info(f"🔄 جاري تحليل الملف: {filename}")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            # تحويل JSON لنص عادي مهيأ
            raw_text = json.dumps(data, ensure_ascii=False, indent=2)
            
            # ✂️ التقطيع الذكي
            chunks = text_splitter.split_text(raw_text)
            logger.info(f"   ✂️ تم تقسيم {filename} بدقة إلى {len(chunks)} مقطع قانوني.")
            
            # تجهيز حزمة الرفع (Batching)
            batch_records = []
            
            for i, chunk in enumerate(chunks):
                clean_chunk = clean_text(chunk) # تنظيف النص قبل تحويله لمتجه
                
                try:
                    # تحويل النص لمتجه
                    embedding_vector = embeddings_model.embed_query(clean_chunk)
                    
                    # بناء السجل مع بيانات وصفية (Metadata) احترافية
                    record = {
                        "content": clean_chunk,
                        "embedding": embedding_vector,
                        "metadata": {
                            "source": filename,
                            "chunk_index": i + 1,
                            "total_chunks": len(chunks),
                            "ingested_at": datetime.utcnow().isoformat()
                        }
                    }
                    batch_records.append(record)
                    
                    # رفع الحزمة إذا وصلت للحد الأقصى أو إذا كنا في المقطع الأخير
                    if len(batch_records) >= BATCH_SIZE or i == len(chunks) - 1:
                        supabase.table("knowledge_base_vectors").insert(batch_records).execute()
                        logger.info(f"   ⬆️ تم رفع حزمة من {len(batch_records)} مقاطع بنجاح لـ Supabase.")
                        batch_records = [] # تفريغ الحزمة للدفعة التالية
                        
                except Exception as embed_err:
                    logger.error(f"   ❌ خطأ أثناء معالجة المقطع {i+1} من {filename}: {embed_err}")
                    continue # إكمال باقي المقاطع حتى لو فشل واحد
                    
        except json.JSONDecodeError:
            logger.error(f"   ❌ خطأ: الملف {filename} يحتوي على صيغة JSON غير صالحة.")
        except Exception as e:
            logger.error(f"   ❌ حدث خطأ غير متوقع في ملف {filename}: {e}")

    logger.info("\n🎉 اكتملت عملية التغذية (Ingestion) بنجاح وبأعلى معايير الاعتمادية!")

if __name__ == "__main__":
    ingest_json_files()