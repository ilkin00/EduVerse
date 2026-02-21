-- Kullanıcılar tablosu
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    hashed_password TEXT,
    is_active BOOLEAN DEFAULT true,
    role VARCHAR(50) DEFAULT 'student',
    subscription_tier VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notlar tablosu
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    note_type VARCHAR(50) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test kullanıcısı ekle
INSERT INTO users (email, username, full_name, role) 
SELECT 'test@eduverse.com', 'testuser', 'Test Kullanıcı', 'student'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'test@eduverse.com');

-- Test notu ekle
INSERT INTO notes (title, content, note_type, user_id) 
SELECT 'Hoş Geldiniz!', 'EduVerse veritabanı başarıyla kuruldu!', 'text', id 
FROM users WHERE username = 'testuser'
ON CONFLICT DO NOTHING;
