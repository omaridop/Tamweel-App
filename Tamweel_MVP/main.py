from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Union, Any, Optional # أضفنا هذه الاستيرادات المهمة
import uvicorn
from ai_engine import get_credit_analysis 

app = FastAPI()

# إعدادات الـ CORS مهمة جداً للاتصال مع Replit والفرونت-إند
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- التعديل الجوهري هنا ---
class AnalysisRequest(BaseModel):
    question: str
    # استخدمنا Union ليقبل قاموس (Dict) أو قائمة (List) أو None
    customer_data: Union[dict, list, Any, None] = None 

# 1. نقطة فحص الحالة
@app.get("/")
async def root():
    return {"status": "online", "message": "Tamweel AI Engine is running"}

# 2. مسار التحليل الائتماني (الذي يستقبل الطلبات من React)
@app.post("/api/chat")
async def analyze_credit(request: AnalysisRequest):
    try:
        # استدعاء المحرك مع البيانات (سواء كانت فردية أو جماعية)
        result = get_credit_analysis(request.question, request.customer_data)
        return {"answer": result}
    except Exception as e:
        print(f"Internal Error: {str(e)}") # طباعة الخطأ في التيرمينال للمساعدة في التصحيح
        return {"answer": f"Error in processing: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)