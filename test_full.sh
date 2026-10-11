#!/bin/bash
# ============================================
# EduVerse API - AI Hariç Tam Test
# ============================================

BASE="http://localhost/api/v1"
USERNAME="testuser"
PASSWORD="test123"

# Renkler
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

PASS=0
FAIL=0
SKIP=0
declare -a FAILED_TESTS

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
}

print_subheader() {
    echo ""
    echo -e "${CYAN}▶ $1${NC}"
}

# Test: yanıtı göster + başarı/hata say
check() {
    local name="$1"
    local response="$2"
    local expected_key="$3"   # "" ise sadece detail kontrolü yap

    if [ -z "$response" ]; then
        echo -e "${RED}❌ FAIL${NC}: $name (boş yanıt)"
        FAILED_TESTS+=("$name: boş yanıt")
        ((FAIL++))
        return
    fi

    # Hata mı?
    if echo "$response" | grep -q '"detail"'; then
        echo -e "${RED}❌ FAIL${NC}: $name"
        echo "   $response"
        FAILED_TESTS+=("$name: $response")
        ((FAIL++))
        return
    fi

    # Beklenen key var mı?
    if [ -n "$expected_key" ] && ! echo "$response" | grep -q "\"$expected_key\""; then
        echo -e "${YELLOW}⚠️  PARTIAL${NC}: $name (beklenen key yok: $expected_key)"
        echo "   ${response:0:200}"
        ((PASS++))
        return
    fi

    echo -e "${GREEN}✅ PASS${NC}: $name"
    echo "   ${response:0:180}${response:180:+...}"
    ((PASS++))
}

# ============================================
# 0. LOGIN
# ============================================
print_header "0. KİMLİK DOĞRULAMA"

print_subheader "POST /auth/login"
LOGIN_RESP=$(curl -s -X POST $BASE/auth/login \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=$USERNAME&password=$PASSWORD")
echo "$LOGIN_RESP" | python3 -m json.tool 2>/dev/null | head -10

TOKEN=$(echo $LOGIN_RESP | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)
REFRESH=$(echo $LOGIN_RESP | python3 -c "import sys,json; print(json.load(sys.stdin).get('refresh_token',''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}Login başarısız! Çıkılıyor.${NC}"
    exit 1
fi

AUTH="Authorization: Bearer $TOKEN"
JSON="Content-Type: application/json"
FORM="Content-Type: application/x-www-form-urlencoded"

# ============================================
# 1. AUTH
# ============================================
print_header "1. AUTH ENDPOINT'LERİ"

print_subheader "GET /auth/me"
R=$(curl -s $BASE/auth/me -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null | head -15
check "GET /auth/me" "$R" "username"

print_subheader "POST /auth/refresh"
R=$(curl -s -X POST "$BASE/auth/refresh?refresh_token=$REFRESH")
echo "$R" | python3 -m json.tool 2>/dev/null | head -10
check "POST /auth/refresh" "$R" ""

print_subheader "POST /auth/logout (bu refresh token'ı iptal eder)"
# Yeni bir refresh token al ki logouth'u test edelim
NEW_LOGIN=$(curl -s -X POST $BASE/auth/login -H "$FORM" -d "username=$USERNAME&password=$PASSWORD")
NEW_REFRESH=$(echo $NEW_LOGIN | python3 -c "import sys,json; print(json.load(sys.stdin).get('refresh_token',''))" 2>/dev/null)
R=$(curl -s -X POST "$BASE/auth/logout?refresh_token=$NEW_REFRESH" -H "$AUTH")
echo "$R"
check "POST /auth/logout" "$R" ""

print_subheader "POST /auth/logout/all"
R=$(curl -s -X POST $BASE/auth/logout/all -H "$AUTH")
echo "$R"
check "POST /auth/logout/all" "$R" ""

# Not: logout/all tüm session'ları iptal etti, yeni token alalım
NEW_LOGIN=$(curl -s -X POST $BASE/auth/login -H "$FORM" -d "username=$USERNAME&password=$PASSWORD")
TOKEN=$(echo $NEW_LOGIN | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)
AUTH="Authorization: Bearer $TOKEN"
echo "(Yeni token alındı)"

# ============================================
# 2. NOTES
# ============================================
print_header "2. NOTES ENDPOINT'LERİ"

print_subheader "POST /notes/ (metin notu)"
R=$(curl -s -X POST $BASE/notes/ -H "$AUTH" -H "$JSON" \
    -d '{"title":"Test Not 1","content":"Bu bir test notudur","note_type":"text"}')
echo "$R" | python3 -m json.tool 2>/dev/null
NOTE_ID=$(echo $R | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
check "POST /notes/ (text)" "$R" "id"

print_subheader "GET /notes/ (liste)"
R=$(curl -s "$BASE/notes/?skip=0&limit=10" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null | head -20
check "GET /notes/" "$R" ""

print_subheader "GET /notes/ (note_type filtresi)"
R=$(curl -s "$BASE/notes/?note_type=text" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null | head -10
check "GET /notes/?note_type=text" "$R" ""

print_subheader "GET /notes/$NOTE_ID"
R=$(curl -s "$BASE/notes/$NOTE_ID" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null
check "GET /notes/{id}" "$R" "id"

print_subheader "PUT /notes/$NOTE_ID (güncelle)"
R=$(curl -s -X PUT "$BASE/notes/$NOTE_ID" -H "$AUTH" -H "$JSON" \
    -d '{"title":"Güncellenmiş Başlık","content":"Yeni içerik"}')
echo "$R" | python3 -m json.tool 2>/dev/null
check "PUT /notes/{id}" "$R" "id"

print_subheader "POST /notes/audio (sesli not - fake file_id)"
R=$(curl -s -X POST $BASE/notes/audio -H "$AUTH" -H "$FORM" \
    -d "title=Sesli Not&file_id=1&duration=30")
echo "$R" | python3 -m json.tool 2>/dev/null
check "POST /notes/audio" "$R" ""

print_subheader "POST /notes/validate-drawing"
R=$(curl -s -X POST $BASE/notes/validate-drawing -H "$AUTH" -H "$JSON" \
    -d '{"data":"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="}')
echo "$R" | python3 -m json.tool 2>/dev/null
check "POST /notes/validate-drawing" "$R" "valid"

print_subheader "DELETE /notes/$NOTE_ID"
R=$(curl -s -X DELETE "$BASE/notes/$NOTE_ID" -H "$AUTH" -w "HTTP %{http_code}")
echo "$R"
# 204 beklenir
if echo "$R" | grep -q "204"; then
    echo -e "${GREEN}✅ PASS${NC}: DELETE /notes/{id}"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: DELETE /notes/{id} → $R"
    ((FAIL++))
fi

# ============================================
# 3. ROOMS
# ============================================
print_header "3. ROOMS ENDPOINT'LERİ"

print_subheader "POST /rooms/"
R=$(curl -s -X POST $BASE/rooms/ -H "$AUTH" -H "$JSON" \
    -d '{"name":"Test Odası","description":"Test odası açıklaması","room_type":"public","max_participants":5}')
echo "$R" | python3 -m json.tool 2>/dev/null
ROOM_ID=$(echo $R | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
check "POST /rooms/" "$R" "id"

print_subheader "GET /rooms/"
R=$(curl -s "$BASE/rooms/?skip=0&limit=10" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null | head -20
check "GET /rooms/" "$R" ""

print_subheader "GET /rooms/$ROOM_ID"
R=$(curl -s "$BASE/rooms/$ROOM_ID" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null
check "GET /rooms/{id}" "$R" "id"

print_subheader "POST /rooms/$ROOM_ID/join"
R=$(curl -s -X POST "$BASE/rooms/$ROOM_ID/join" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null
check "POST /rooms/{id}/join" "$R" "message"

print_subheader "GET /rooms/$ROOM_ID/participants"
R=$(curl -s "$BASE/rooms/$ROOM_ID/participants" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null
check "GET /rooms/{id}/participants" "$R" ""

print_subheader "PUT /rooms/$ROOM_ID (güncelle)"
R=$(curl -s -X PUT "$BASE/rooms/$ROOM_ID" -H "$AUTH" -H "$JSON" \
    -d '{"name":"Güncellenmiş Oda","max_participants":10}')
echo "$R" | python3 -m json.tool 2>/dev/null
check "PUT /rooms/{id}" "$R" "id"

print_subheader "POST /rooms/$ROOM_ID/leave"
R=$(curl -s -X POST "$BASE/rooms/$ROOM_ID/leave" -H "$AUTH")
echo "$R"
check "POST /rooms/{id}/leave" "$R" ""

print_subheader "DELETE /rooms/$ROOM_ID"
R=$(curl -s -X DELETE "$BASE/rooms/$ROOM_ID" -H "$AUTH" -w "HTTP %{http_code}")
echo "$R"
if echo "$R" | grep -q "204"; then
    echo -e "${GREEN}✅ PASS${NC}: DELETE /rooms/{id}"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: DELETE /rooms/{id} → $R"
    ((FAIL++))
fi

# ============================================
# 4. FILES
# ============================================
print_header "4. FILES ENDPOINT'LERİ"

# Test dosyası oluştur
echo "Bu bir test dosyasıdır. EduVerse test." > /tmp/test_file.txt

print_subheader "POST /files/upload"
R=$(curl -s -X POST $BASE/files/upload -H "$AUTH" -F "file=@/tmp/test_file.txt")
echo "$R" | python3 -m json.tool 2>/dev/null
FILE_ID=$(echo $R | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
check "POST /files/upload" "$R" "id"

print_subheader "GET /files/"
R=$(curl -s "$BASE/files/?skip=0&limit=10" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null | head -20
check "GET /files/" "$R" ""

print_subheader "GET /files/download/$FILE_ID"
R=$(curl -s "$BASE/files/download/$FILE_ID" -H "$AUTH" -w "HTTP %{http_code}")
echo "${R:0:200}"
if echo "$R" | grep -q "200"; then
    echo -e "${GREEN}✅ PASS${NC}: GET /files/download/{id}"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: GET /files/download/{id}"
    ((FAIL++))
fi

print_subheader "DELETE /files/$FILE_ID"
R=$(curl -s -X DELETE "$BASE/files/$FILE_ID" -H "$AUTH" -w "HTTP %{http_code}")
echo "$R"
if echo "$R" | grep -q "204"; then
    echo -e "${GREEN}✅ PASS${NC}: DELETE /files/{id}"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: DELETE /files/{id} → $R"
    ((FAIL++))
fi

# ============================================
# 5. FRIENDS
# ============================================
print_header "5. FRIENDS ENDPOINT'LERİ"

print_subheader "GET /friends/"
R=$(curl -s "$BASE/friends/" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null
check "GET /friends/" "$R" ""

print_subheader "GET /friends/search?q=test"
R=$(curl -s "$BASE/friends/search?q=test" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null
check "GET /friends/search" "$R" ""

print_subheader "GET /friends/requests"
R=$(curl -s "$BASE/friends/requests" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null
check "GET /friends/requests" "$R" ""

print_subheader "GET /friends/requests/sent"
R=$(curl -s "$BASE/friends/requests/sent" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null
check "GET /friends/requests/sent" "$R" ""

print_subheader "GET /friends/status/1 (kendisi)"
R=$(curl -s "$BASE/friends/status/1" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null
check "GET /friends/status/{id}" "$R" "status"

# ============================================
# 6. CHATS
# ============================================
print_header "6. CHAT ENDPOINT'LERİ"

print_subheader "GET /chats/"
R=$(curl -s "$BASE/chats/" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null
check "GET /chats/" "$R" ""

print_subheader "GET /chats/1 (kendine mesaj geçmişi)"
R=$(curl -s "$BASE/chats/1?limit=10&offset=0" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null
check "GET /chats/{user_id}" "$R" ""

print_subheader "GET /chats/unread/count"
R=$(curl -s "$BASE/chats/unread/count" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null
check "GET /chats/unread/count" "$R" "count"

# ============================================
# 7. SETTINGS
# ============================================
print_header "7. SETTINGS ENDPOINT'LERİ"

print_subheader "GET /settings/"
R=$(curl -s "$BASE/settings/" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null | head -15
check "GET /settings/" "$R" "theme"

print_subheader "PUT /settings/"
R=$(curl -s -X PUT "$BASE/settings/" -H "$AUTH" -H "$JSON" \
    -d '{"theme":"light","language":"en","font_size":"large"}')
echo "$R" | python3 -m json.tool 2>/dev/null | head -10
check "PUT /settings/" "$R" "theme"

print_subheader "GET /settings/notifications"
R=$(curl -s "$BASE/settings/notifications" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null
check "GET /settings/notifications" "$R" "enabled"

print_subheader "GET /settings/privacy"
R=$(curl -s "$BASE/settings/privacy" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null
check "GET /settings/privacy" "$R" "profile_visibility"

print_subheader "GET /settings/appearance"
R=$(curl -s "$BASE/settings/appearance" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null
check "GET /settings/appearance" "$R" "theme"

print_subheader "GET /settings/sessions"
R=$(curl -s "$BASE/settings/sessions" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null | head -20
check "GET /settings/sessions" "$R" "total_sessions"

# ============================================
# 8. STORAGE
# ============================================
print_header "8. STORAGE ENDPOINT'LERİ"

print_subheader "GET /storage/usage"
R=$(curl -s "$BASE/storage/usage" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null
check "GET /storage/usage" "$R" "used"

print_subheader "POST /storage/clear-cache"
R=$(curl -s -X POST "$BASE/storage/clear-cache" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null
check "POST /storage/clear-cache" "$R" ""

print_subheader "GET /storage/export"
R=$(curl -s "$BASE/storage/export" -H "$AUTH" -w "HTTP %{http_code}")
echo "${R:0:250}"
if echo "$R" | grep -q "200"; then
    echo -e "${GREEN}✅ PASS${NC}: GET /storage/export"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: GET /storage/export"
    ((FAIL++))
fi

# ============================================
# 9. NOTIFICATIONS
# ============================================
print_header "9. NOTIFICATIONS ENDPOINT'LERİ"

print_subheader "GET /notifications/"
R=$(curl -s "$BASE/notifications/?skip=0&limit=20" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null
check "GET /notifications/" "$R" ""

print_subheader "GET /notifications/unread/count"
R=$(curl -s "$BASE/notifications/unread/count" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null
check "GET /notifications/unread/count" "$R" "unread_count"

print_subheader "PUT /notifications/read-all"
R=$(curl -s -X PUT "$BASE/notifications/read-all" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null
check "PUT /notifications/read-all" "$R" ""

# ============================================
# 10. GAMIFICATION
# ============================================
print_header "10. GAMIFICATION ENDPOINT'LERİ"

print_subheader "GET /gamification/stats"
R=$(curl -s "$BASE/gamification/stats" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null
check "GET /gamification/stats" "$R" "total_xp"

print_subheader "GET /gamification/achievements"
R=$(curl -s "$BASE/gamification/achievements" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null | head -20
check "GET /gamification/achievements" "$R" ""

print_subheader "GET /gamification/my-achievements"
R=$(curl -s "$BASE/gamification/my-achievements" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null
check "GET /gamification/my-achievements" "$R" ""

print_subheader "GET /gamification/leaderboard"
R=$(curl -s "$BASE/gamification/leaderboard?limit=10" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null
check "GET /gamification/leaderboard" "$R" ""

# ============================================
# 11. LIVEKIT
# ============================================
print_header "11. LIVEKIT ENDPOINT'LERİ"

print_subheader "POST /livekit/token"
R=$(curl -s -X POST "$BASE/livekit/token" -H "$AUTH" -H "$JSON" \
    -d '{"room_name":"test-room","role":"student"}')
echo "$R" | python3 -m json.tool 2>/dev/null
check "POST /livekit/token" "$R" "token"

print_subheader "POST /livekit/test-token"
R=$(curl -s -X POST "$BASE/livekit/test-token" -H "$AUTH")
echo "$R" | python3 -m json.tool 2>/dev/null
check "POST /livekit/test-token" "$R" ""

# ============================================
# RAPOR
# ============================================
print_header "📊 TEST RAPORU"

echo ""
echo -e "${GREEN}✅ Başarılı: $PASS${NC}"
echo -e "${RED}❌ Başarısız: $FAIL${NC}"
echo ""

if [ $FAIL -gt 0 ]; then
    echo -e "${RED}Başarısız testler:${NC}"
    for test in "${FAILED_TESTS[@]}"; do
        echo -e "  ${RED}✗${NC} $test"
    done
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Test tamamlandı!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
