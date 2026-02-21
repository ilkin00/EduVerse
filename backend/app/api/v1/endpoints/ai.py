from fastapi import APIRouter, Depends, HTTPException, Body, Query
from typing import Optional, List
from app.services.ai_service import AIService, MODELS
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()
ai_service = AIService()

@router.get("/models")
async def get_models(current_user: User = Depends(get_current_user)):
    """Kullanılabilir modelleri listele"""
    return {
        "models": MODELS,
        "default": "openai/gpt-3.5-turbo"
    }

@router.post("/chat")
async def chat(
    message: str = Body(..., embed=True),
    model: str = Body("openai/gpt-3.5-turbo", embed=True),
    temperature: float = Body(0.7, embed=True),
    current_user: User = Depends(get_current_user)
):
    """Sohbet et"""
    
    messages = [
        {"role": "system", "content": "Sen yardımsever bir eğitim asistanısın. Türkçe cevap ver."},
        {"role": "user", "content": message}
    ]
    
    result = await ai_service.chat_completion(messages, model=model, temperature=temperature)
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return result

@router.post("/explain")
async def explain(
    topic: str = Body(...),
    level: str = Body("üniversite"),
    model: str = Body("openai/gpt-3.5-turbo"),
    current_user: User = Depends(get_current_user)
):
    """Konu açıkla"""
    explanation = await ai_service.explain_topic(topic, level, model)
    return {"explanation": explanation}

@router.post("/solve-math")
async def solve_math(
    problem: str = Body(...),
    model: str = Body("openai/gpt-3.5-turbo"),
    current_user: User = Depends(get_current_user)
):
    """Matematik problemi çöz"""
    solution = await ai_service.solve_math_problem(problem, model)
    return {"solution": solution}

@router.post("/summarize")
async def summarize(
    text: str = Body(...),
    model: str = Body("openai/gpt-3.5-turbo"),
    current_user: User = Depends(get_current_user)
):
    """Metin özetle"""
    summary = await ai_service.summarize_text(text, model)
    return {"summary": summary}

@router.post("/generate-quiz")
async def generate_quiz(
    topic: str = Body(...),
    num_questions: int = Body(5),
    difficulty: str = Body("orta"),
    model: str = Body("openai/gpt-3.5-turbo"),
    current_user: User = Depends(get_current_user)
):
    """Quiz oluştur"""
    quiz = await ai_service.generate_quiz(topic, num_questions, difficulty, model)
    return {"quiz": quiz}

@router.post("/translate")
async def translate(
    text: str = Body(...),
    target_lang: str = Body("Türkçe"),
    model: str = Body("openai/gpt-3.5-turbo"),
    current_user: User = Depends(get_current_user)
):
    """Metin çevir"""
    translation = await ai_service.translate_text(text, target_lang, model)
    return {"translation": translation}

@router.post("/flashcards")
async def flashcards(
    topic: str = Body(...),
    num_cards: int = Body(10),
    model: str = Body("openai/gpt-3.5-turbo"),
    current_user: User = Depends(get_current_user)
):
    """Flashcard oluştur"""
    cards = await ai_service.generate_flashcards(topic, num_cards, model)
    return {"flashcards": cards}

@router.post("/code-assist")
async def code_assist(
    code: str = Body(...),
    task: str = Body("açıkla"),
    language: str = Body("python"),
    model: str = Body("deepseek/deepseek-coder"),
    current_user: User = Depends(get_current_user)
):
    """Kod yardımı (açıklama, hata ayıklama, optimize etme)"""
    
    prompts = {
        "açıkla": f"Şu {language} kodunu açıkla, ne yaptığını anlat: {code}",
        "debug": f"Şu {language} kodundaki hataları bul ve düzelt: {code}",
        "optimize": f"Şu {language} kodunu optimize et, daha hızlı çalışacak şekilde düzenle: {code}",
        "test": f"Şu {language} kodu için test fonksiyonları yaz: {code}"
    }
    
    prompt = prompts.get(task, prompts["açıkla"])
    
    messages = [
        {"role": "system", "content": f"Sen bir {language} programlama uzmanısın."},
        {"role": "user", "content": prompt}
    ]
    
    result = await ai_service.chat_completion(messages, model=model, temperature=0.3)
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return result
