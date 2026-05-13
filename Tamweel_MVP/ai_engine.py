"""
============================================================
          TAMWEEL NEURAL ENGINE - NEXUS ELITE V4
    Elite Strategy, Risk Architecture & Precision Protocol
============================================================
"""

import os
import re
import json
import anthropic
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings

# ─── 1. CONFIGURATION ──────────────────────────────────────────────────────
load_dotenv()

supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
client = anthropic.Anthropic(api_key=os.getenv("CLAUDE_API_KEY"))

# الموديل المعتمد
MODEL_NAME = "claude-sonnet-4-6" 
embeddings_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# ─── 2. LEGAL RETRIEVAL (RAG) ──────────────────────────────────────────────
def search_legal_docs(query: str) -> str:
    """جلب النصوص القانونية ذات الصلة بالامتثال الائتماني"""
    query_embedding = embeddings_model.embed_query(query)
    response = supabase.rpc('match_documents', {
        'query_embedding': query_embedding,
        'match_threshold': 0.3,
        'match_count': 5
    }).execute()
    return "\n".join([doc['content'] for doc in response.data])

# ─── 3. THE MASTER ENGINE (NEXUS + PRECISION UX) ──────────────────────────────
def get_credit_analysis(query: str, customer_data: dict) -> str:
    """محرك التحليل الائتماني المبرمج لإعطاء خلاصة قصيرة فقط (بدون تقارير طويلة)"""
    legal_context = search_legal_docs(query if query else "إطار العمل الائتماني")
    
    system_prompt = """
أنت "المهندس الاستراتيجي لنظام Nexus" في منصة TAMWEEL وخبير في (Behavioral Credit Rehabilitation).
قاعدتك الذهبية الإلزامية: الكثافة العالية جداً، والرد القصير جداً دائماً في جميع الحالات (3-4 أسطر كحد أقصى). 
🚨 ممنوع التفصيل أو الشرح طويلاً حتى لو سألك المستخدم "لماذا"، "اشرح"، أو "تفاصيل".

الهيكل الإلزامي الوحيد للإجابة (حافظ عليه حرفياً دائماً):
👤 [الاسم] | [الوظيفة أو الدخل التقديري]
📊 السكور: [الرقم]/100 | القرار: [موافقة / تدقيق / رفض] - [المبلغ إن وجد]
🔍 الخلل الرئيسي: [سبب القرار بكلمات بسيطة وسطر واحد فقط]
🚀 للتحسين:
[خطة تعافي من 2-3 خطوات مرقمة (1، 2، 3) باختصار شديد تعالج الخلل الرئيسي، مع تحديد إطار زمني. السطر الأخير يحدد موعد إعادة التقديم. أقصى حد لقسم التحسين هو 4 أسطر].

🚨 قواعد صارمة جداً:
- ممنوع منعاً باتاً استخدام علامات النجوم (**) أو أي رموز تنسيق (Markdown) لمحاولة تضخيم الخط. اكتب النص بشكل عادي ومجرد (Plain Text) ليبدو ككتابة بشرية طبيعية.
- لا تضف أي مقدمات، أو خاتمة، أو تقارير امتثال قانونية، أو رؤية مؤسس. التزم بالهيكل القصير أعلاه فقط.
- في غياب بيانات الدخل، استخدم (Proxy Logic) وافترض مهن منطقية لضمان عمل الـ Demo.
- إذا كان السؤال عن "مجموعة" أو "أفضل 3"، استخدم نفس الهيكل القصير لكل عميل.
"""
    
    try:
        # Temperature = 0.1 لضمان صرامة النموذج في اتباع شكل النقاط المرقمة وعدم الهلوسة
        message = client.messages.create(
            model=MODEL_NAME,
            max_tokens=1500,
            temperature=0.1, 
            system=system_prompt,
            messages=[{"role": "user", "content": f"Query: {query}\nData: {json.dumps(customer_data)}\nLegal Context: {legal_context}"}]
        )
        return message.content[0].text
    except Exception as e:
        return f"❌ خطأ في النظام السيادي: {str(e)}"

# ─── 4. STRATEGIC ADVISOR (RAG) ─────────────────────────────────────────────
def get_answer_from_rag(user_query: str) -> str:
    """مستشار بناء الستارت-أب: إجابات حادة، مباشرة، وعميقة"""
    context = search_legal_docs(user_query)
    
    precision_instruction = "أجب كمدير تقني (CTO). كثافة معلوماتية قصوى. لا حشو. لا مقدمات."
    
    try:
        chat_message = client.messages.create(
            model=MODEL_NAME,
            max_tokens=1500,
            system=precision_instruction,
            messages=[{"role": "user", "content": f"Legal Context: {context}\nStartup Inquiry: {user_query}"}]
        )
        return chat_message.content[0].text
    except Exception as e:
        return f"❌ خطأ: {str(e)}"