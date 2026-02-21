import httpx
import json
from typing import List, Dict, Any, Optional
from app.core.config import settings

# Kullanılabilir modeller (Türkiye'de çalışanlar)
MODELS = {
    "mistralai/mistral-7b-instruct": "Mistral 7B (Hızlı, Ücretsiz)",
    "meta-llama/llama-2-70b-chat": "Llama 2 70B (Güçlü)",
    "deepseek/deepseek-chat": "DeepSeek (Kod için iyi)",
    "google/gemini-pro": "Gemini Pro (Google)",
    "anthropic/claude-3-haiku": "Claude 3 Haiku (Hızlı)",
    "cohere/command": "Cohere Command",
    "microsoft/phi-3-mini-128k-instruct": "Phi-3 Mini (Çok hızlı)",
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
    
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = "mistralai/mistral-7b-instruct",
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> Dict[str, Any]:
        """OpenRouter üzerinden sohbet tamamlama"""
        
        if not self.api_key:
            return {"error": "API anahtarı bulunamadı"}
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(
                    self.base_url,
                    headers=self.headers,
                    json=payload
                )
                
                if response.status_code == 403:
                    error_detail = response.json()
                    if "openai" in model:
                        return {"error": "OpenAI modelleri Türkiye'de çalışmıyor. Mistral veya Llama kullanın."}
                    return {"error": f"Yetki hatası: {error_detail}"}
                
                response.raise_for_status()
                return response.json()
                
            except Exception as e:
                return {"error": f"Bağlantı hatası: {str(e)}"}
    
    async def explain_topic(
        self,
        topic: str,
        level: str = "üniversite",
        model: str = "mistralai/mistral-7b-instruct"
    ) -> str:
        """Bir konuyu açıkla"""
        
        messages = [
            {
                "role": "system",
                "content": f"Sen bir eğitim asistanısın. {level} seviyesinde Türkçe açıklama yap."
            },
            {
                "role": "user",
                "content": f"'{topic}' konusunu açıkla"
            }
        ]
        
        result = await self.chat_completion(messages, model=model)
        
        if "error" in result:
            return f"Hata: {result['error']}"
        
        try:
            return result["choices"][0]["message"]["content"]
        except:
            return "Cevap alınamadı"
    
    async def solve_math_problem(
        self,
        problem: str,
        model: str = "mistralai/mistral-7b-instruct"
    ) -> str:
        """Matematik problemi çöz"""
        
        messages = [
            {
                "role": "system",
                "content": "Matematik problemlerini adım adım çözen asistan"
            },
            {
                "role": "user",
                "content": problem
            }
        ]
        
        result = await self.chat_completion(messages, model=model, temperature=0.3)
        
        if "error" in result:
            return f"Hata: {result['error']}"
        
        try:
            return result["choices"][0]["message"]["content"]
        except:
            return "Çözülemedi"
    
    async def summarize_text(
        self,
        text: str,
        model: str = "mistralai/mistral-7b-instruct"
    ) -> str:
        """Metin özetle"""
        
        messages = [
            {
                "role": "system",
                "content": "Metni özetle, ana noktaları çıkar"
            },
            {
                "role": "user",
                "content": f"Özetle: {text[:2000]}"
            }
        ]
        
        result = await self.chat_completion(messages, model=model, temperature=0.5)
        
        if "error" in result:
            return f"Hata: {result['error']}"
        
        try:
            return result["choices"][0]["message"]["content"]
        except:
            return "Özetlenemedi"
    
    async def generate_quiz(
        self,
        topic: str,
        num_questions: int = 5,
        difficulty: str = "orta",
        model: str = "mistralai/mistral-7b-instruct"
    ) -> str:
        """Quiz oluştur"""
        
        messages = [
            {
                "role": "system",
                "content": f"{difficulty} zorlukta {num_questions} soruluk quiz hazırla"
            },
            {
                "role": "user",
                "content": f"{topic} konusunda quiz"
            }
        ]
        
        result = await self.chat_completion(messages, model=model, temperature=0.7)
        
        if "error" in result:
            return f"Hata: {result['error']}"
        
        try:
            return result["choices"][0]["message"]["content"]
        except:
            return "Quiz oluşturulamadı"
    
    async def translate_text(
        self,
        text: str,
        target_lang: str = "Türkçe",
        model: str = "mistralai/mistral-7b-instruct"
    ) -> str:
        """Metin çevir"""
        
        messages = [
            {
                "role": "system",
                "content": f"Çeviri yap: {target_lang}"
            },
            {
                "role": "user",
                "content": text
            }
        ]
        
        result = await self.chat_completion(messages, model=model, temperature=0.3)
        
        if "error" in result:
            return f"Hata: {result['error']}"
        
        try:
            return result["choices"][0]["message"]["content"]
        except:
            return "Çeviri yapılamadı"
    
    async def generate_flashcards(
        self,
        topic: str,
        num_cards: int = 10,
        model: str = "mistralai/mistral-7b-instruct"
    ) -> str:
        """Flashcard oluştur"""
        
        messages = [
            {
                "role": "system",
                "content": f"{num_cards} tane flashcard hazırla. Format: Soru: ... Cevap: ..."
            },
            {
                "role": "user",
                "content": topic
            }
        ]
        
        result = await self.chat_completion(messages, model=model, temperature=0.6)
        
        if "error" in result:
            return f"Hata: {result['error']}"
        
        try:
            return result["choices"][0]["message"]["content"]
        except:
            return "Flashcard oluşturulamadı"
