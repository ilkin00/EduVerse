import httpx
import json
from typing import List, Dict, Any, Optional
from app.core.config import settings

# Kullanılabilir modeller (SADECE ÇALIŞANLAR)
MODELS = {
    "mistralai/mixtral-8x7b-instruct": "Mixtral 8x7B (Çalışıyor, Ücretsiz)",
    "mistralai/mistral-7b-instruct": "Mistral 7B (Deneysel)",
}

class AIService:
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.base_url = settings.OPENROUTER_API_URL
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "EduVerse AI Assistant"
        }
        # Varsayılan model (ÇALIŞAN)
        self.default_model = "mistralai/mixtral-8x7b-instruct"
    
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> Dict[str, Any]:
        """OpenRouter üzerinden sohbet tamamlama"""
        
        if not self.api_key:
            return {"error": "API anahtarı bulunamadı. Lütfen .env dosyasını kontrol edin."}
        
        # Model seçimi
        use_model = model or self.default_model
        
        # OpenAI modellerini engelle
        if "openai" in use_model or "gpt" in use_model:
            return {"error": "OpenAI modelleri Türkiye'de çalışmıyor. Mixtral kullanın."}
        
        payload = {
            "model": use_model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        print(f"📤 İstek gönderiliyor: {use_model}")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    self.base_url,
                    headers=self.headers,
                    json=payload
                )
                
                print(f"📥 Cevap kodu: {response.status_code}")
                
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 401:
                    return {"error": "API anahtarı geçersiz. .env dosyasını kontrol edin."}
                elif response.status_code == 404:
                    return {"error": f"Model bulunamadı: {use_model}. Lütfen geçerli bir model seçin."}
                else:
                    return {"error": f"API hatası: {response.status_code}"}
                    
            except Exception as e:
                return {"error": f"Bağlantı hatası: {str(e)}"}
    
    async def explain_topic(self, topic: str, level: str = "üniversite", model: Optional[str] = None) -> str:
        """Konu anlatımı"""
        messages = [
            {"role": "system", "content": f"Sen bir eğitim asistanısın. {level} seviyesinde Türkçe açıklama yap."},
            {"role": "user", "content": f"'{topic}' konusunu detaylıca açıkla."}
        ]
        result = await self.chat_completion(messages, model=model)
        
        if "error" in result:
            return f"Hata: {result['error']}"
        
        try:
            return result["choices"][0]["message"]["content"]
        except:
            return "Cevap alınamadı"
    
    async def solve_math_problem(self, problem: str, model: Optional[str] = None) -> str:
        """Matematik problemi çöz"""
        messages = [
            {"role": "system", "content": "Matematik problemlerini adım adım çöz. Türkçe anlat."},
            {"role": "user", "content": problem}
        ]
        result = await self.chat_completion(messages, model=model, temperature=0.3)
        
        if "error" in result:
            return f"Hata: {result['error']}"
        
        try:
            return result["choices"][0]["message"]["content"]
        except:
            return "Çözülemedi"
    
    async def summarize_text(self, text: str, model: Optional[str] = None) -> str:
        """Metin özetle"""
        messages = [
            {"role": "system", "content": "Metni özetle, ana noktaları çıkar. Türkçe özet ver."},
            {"role": "user", "content": f"Özetle: {text[:1500]}"}
        ]
        result = await self.chat_completion(messages, model=model, temperature=0.5)
        
        if "error" in result:
            return f"Hata: {result['error']}"
        
        try:
            return result["choices"][0]["message"]["content"]
        except:
            return "Özetlenemedi"
    
    async def generate_quiz(self, topic: str, num_questions: int = 5, difficulty: str = "orta", model: Optional[str] = None) -> str:
        """Quiz oluştur"""
        messages = [
            {"role": "system", "content": f"{difficulty} zorlukta {num_questions} soruluk quiz hazırla. Sorular ve cevaplar Türkçe olsun."},
            {"role": "user", "content": f"{topic} konusunda quiz"}
        ]
        result = await self.chat_completion(messages, model=model, temperature=0.7)
        
        if "error" in result:
            return f"Hata: {result['error']}"
        
        try:
            return result["choices"][0]["message"]["content"]
        except:
            return "Quiz oluşturulamadı"
    
    async def translate_text(self, text: str, target_lang: str = "İngilizce", model: Optional[str] = None) -> str:
        """Metin çevir"""
        messages = [
            {"role": "system", "content": f"Çeviri yap: {target_lang}. Sadece çeviriyi ver."},
            {"role": "user", "content": text}
        ]
        result = await self.chat_completion(messages, model=model, temperature=0.3)
        
        if "error" in result:
            return f"Hata: {result['error']}"
        
        try:
            return result["choices"][0]["message"]["content"]
        except:
            return "Çeviri yapılamadı"
    
    async def generate_flashcards(self, topic: str, num_cards: int = 10, model: Optional[str] = None) -> str:
        """Flashcard oluştur"""
        messages = [
            {"role": "system", "content": f"{num_cards} flashcard hazırla. Format: Soru: ... Cevap: ... (Türkçe)"},
            {"role": "user", "content": topic}
        ]
        result = await self.chat_completion(messages, model=model, temperature=0.6)
        
        if "error" in result:
            return f"Hata: {result['error']}"
        
        try:
            return result["choices"][0]["message"]["content"]
        except:
            return "Flashcard oluşturulamadı"
