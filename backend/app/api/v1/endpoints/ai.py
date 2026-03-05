from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from app.services.ai_service import AIService, MODELS
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user
from pydantic import BaseModel

# Request/Response modelleri
class ChatRequest(BaseModel):
    message: str
    model: Optional[str] = None
    temperature: float = 0.7

class ChatResponse(BaseModel):
    response: str
    model: str

class ExplainRequest(BaseModel):
    topic: str
    level: str = "üniversite"
    model: Optional[str] = None

class ExplainResponse(BaseModel):
    explanation: str

class MathRequest(BaseModel):
    problem: str
    model: Optional[str] = None

class MathResponse(BaseModel):
    solution: str

class SummarizeRequest(BaseModel):
    text: str
    model: Optional[str] = None

class SummarizeResponse(BaseModel):
    summary: str

class QuizRequest(BaseModel):
    topic: str
    num_questions: int = 5
    difficulty: str = "orta"
    model: Optional[str] = None

class QuizResponse(BaseModel):
    quiz: str

class TranslateRequest(BaseModel):
    text: str
    target_lang: str = "İngilizce"
    model: Optional[str] = None

class TranslateResponse(BaseModel):
    translation: str

class FlashcardRequest(BaseModel):
    topic: str
    num_cards: int = 10
    model: Optional[str] = None

class FlashcardResponse(BaseModel):
    flashcards: str

class ModelResponse(BaseModel):
    id: str
    name: str
    provider: str = "Mistral"

router = APIRouter()
ai_service = AIService()

@router.get("/models", response_model=List[ModelResponse])
async def get_models(current_user: User = Depends(get_current_user)):
    """Kullanılabilir modelleri listele"""
    return [
        {"id": k, "name": v, "provider": "Mistral"} 
        for k, v in MODELS.items()
    ]

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, current_user: User = Depends(get_current_user)):
    """Sohbet et"""
    messages = [
        {"role": "system", "content": "Sen yardımsever bir eğitim asistanısın. Türkçe cevap ver."},
        {"role": "user", "content": request.message}
    ]
    
    result = await ai_service.chat_completion(
        messages, 
        model=request.model,
        temperature=request.temperature
    )
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return ChatResponse(
        response=result["choices"][0]["message"]["content"],
        model=result.get("model", "unknown")
    )

@router.post("/explain", response_model=ExplainResponse)
async def explain(request: ExplainRequest, current_user: User = Depends(get_current_user)):
    """Konu açıkla"""
    explanation = await ai_service.explain_topic(
        request.topic, 
        request.level, 
        request.model
    )
    return ExplainResponse(explanation=explanation)

@router.post("/solve-math", response_model=MathResponse)
async def solve_math(request: MathRequest, current_user: User = Depends(get_current_user)):
    """Matematik problemi çöz"""
    solution = await ai_service.solve_math_problem(request.problem, request.model)
    return MathResponse(solution=solution)

@router.post("/summarize", response_model=SummarizeResponse)
async def summarize(request: SummarizeRequest, current_user: User = Depends(get_current_user)):
    """Metin özetle"""
    summary = await ai_service.summarize_text(request.text, request.model)
    return SummarizeResponse(summary=summary)

@router.post("/generate-quiz", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest, current_user: User = Depends(get_current_user)):
    """Quiz oluştur"""
    quiz = await ai_service.generate_quiz(
        request.topic, 
        request.num_questions, 
        request.difficulty, 
        request.model
    )
    return QuizResponse(quiz=quiz)

@router.post("/translate", response_model=TranslateResponse)
async def translate(request: TranslateRequest, current_user: User = Depends(get_current_user)):
    """Metin çevir"""
    translation = await ai_service.translate_text(
        request.text, 
        request.target_lang, 
        request.model
    )
    return TranslateResponse(translation=translation)

@router.post("/flashcards", response_model=FlashcardResponse)
async def flashcards(request: FlashcardRequest, current_user: User = Depends(get_current_user)):
    """Flashcard oluştur"""
    cards = await ai_service.generate_flashcards(
        request.topic, 
        request.num_cards, 
        request.model
    )
    return FlashcardResponse(flashcards=cards)
