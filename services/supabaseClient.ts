
import { createClient } from '@supabase/supabase-js';

/**
 * CONFIGURAÇÃO MANUAL (PARA LEIGOS):
 * 1. Cole a "Project URL" entre as aspas em SUPABASE_URL_MANUAL
 * 2. Cole a "Chave publicável" entre as aspas em SUPABASE_KEY_MANUAL
 */
const SUPABASE_URL_MANUAL = 'https://gdyclngehbmweuencqsi.supabase.co'; // <-- COLE A URL DO PROJETO AQUI (Ex: https://xyz.supabase.co)
const SUPABASE_KEY_MANUAL = 'sb_publishable_1PyNgzYqiRuz8J5xkSjVHA_8bVSG0d1'; // <-- COLE A CHAVE PUBLICÁVEL AQUI (Ex: sb_publishable_...)

const getEnvVar = (key: string): string => {
  // Tenta primeiro o que você colou manualmente acima
  if (key === 'VITE_SUPABASE_URL' && SUPABASE_URL_MANUAL) return SUPABASE_URL_MANUAL;
  if (key === 'VITE_SUPABASE_ANON_KEY' && SUPABASE_KEY_MANUAL) return SUPABASE_KEY_MANUAL;

  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch (e) {}

  try {
    const meta = import.meta as any;
    if (meta && meta.env && meta.env[key]) {
      return meta.env[key] as string;
    }
  } catch (e) {}

  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

export const isDbConfigured = () => {
  const isConfigured = (
    !!supabaseUrl && 
    supabaseUrl.startsWith('http') && 
    !!supabaseAnonKey &&
    supabaseAnonKey.length > 20 &&
    supabaseUrl !== 'https://placeholder.supabase.co'
  );
  
  if (!isConfigured) {
    console.warn("⚠️ Supabase não configurado. Verifique as chaves no arquivo services/supabaseClient.ts");
  }
  
  return isConfigured;
};

const finalUrl = isDbConfigured() ? supabaseUrl : 'https://placeholder.supabase.co';
const finalKey = isDbConfigured() ? supabaseAnonKey : 'placeholder-key';

export const supabase = createClient(finalUrl, finalKey);
