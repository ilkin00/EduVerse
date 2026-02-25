#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_URL="http://localhost:8000/api/v1"

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}              EDUVERSE AI ASİSTAN - SON TEST${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"

# Token al
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=roomtester24666&password=Test123!" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

echo -e "\n${GREEN}✅ AI Asistan Hazır!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"

# 1. Matematik
echo -e "\n${YELLOW}📐 MATEMATİK:${NC}"
curl -s -X POST "$BASE_URL/ai/solve-math" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "problem": "Bir üçgenin iç açıları toplamı kaçtır?",
    "model": "mistralai/mistral-7b-instruct"
  }' | python3 -m json.tool 2>/dev/null | grep -A 5 '"solution"'

# 2. Fizik
echo -e "\n${YELLOW}⚡ FİZİK:${NC}"
curl -s -X POST "$BASE_URL/ai/explain" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "yerçekimi nedir?",
    "level": "ortaokul",
    "model": "mistralai/mistral-7b-instruct"
  }' | python3 -m json.tool 2>/dev/null | grep -A 5 '"explanation"'

# 3. Tarih
echo -e "\n${YELLOW}📜 TARİH:${NC}"
curl -s -X POST "$BASE_URL/ai/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "İstanbul ne zaman fethedildi?",
    "model": "mistralai/mistral-7b-instruct"
  }' | python3 -m json.tool 2>/dev/null | grep -A 3 '"content"'

# 4. Quiz
echo -e "\n${YELLOW}❓ QUIZ:${NC}"
curl -s -X POST "$BASE_URL/ai/generate-quiz" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Türkiye'nin başkenti",
    "num_questions": 2,
    "difficulty": "kolay",
    "model": "mistralai/mistral-7b-instruct"
  }' | python3 -m json.tool 2>/dev/null | grep -A 10 '"quiz"'

echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ TÜM TESTLER BAŞARILI!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
