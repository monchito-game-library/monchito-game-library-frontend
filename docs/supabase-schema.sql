-- ========================================
-- SCHEMA PARA MONCHITO GAME LIBRARY
-- ========================================
-- Ejecuta este script en Supabase SQL Editor
-- (Settings > SQL Editor > New Query)

-- 1. Crear la tabla de juegos
CREATE TABLE IF NOT EXISTS games (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  price NUMERIC,
  store TEXT NOT NULL,
  condition TEXT NOT NULL,
  platinum BOOLEAN NOT NULL DEFAULT false,
  description TEXT NOT NULL DEFAULT '',
  platform TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(user_id);
CREATE INDEX IF NOT EXISTS idx_games_platform ON games(platform);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);

-- 3. Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Trigger que actualiza updated_at en cada UPDATE
DROP TRIGGER IF EXISTS update_games_updated_at ON games;
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Deshabilitar RLS temporalmente (para desarrollo)
-- Esto permite acceso completo sin autenticación
ALTER TABLE games DISABLE ROW LEVEL SECURITY;

-- ========================================
-- ✅ SCRIPT COMPLETADO
-- ========================================
-- Ahora puedes usar la aplicación con Supabase
