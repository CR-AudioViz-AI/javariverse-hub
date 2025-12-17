// CR AudioViz AI - Free API Health Check Library
// File: /lib/free-api-health.ts
// Auto-deployed: Wednesday, December 17, 2025

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface APIHealthStatus {
  service: string;
  category: string;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  latency: number;
  lastChecked: Date;
  message?: string;
  fallback?: string;
  isFree: boolean;
  annualValue: number;
}

export interface APIConfig {
  name: string;
  category: string;
  testUrl: string;
  timeout: number;
  fallbacks: string[];
  isFree: boolean;
  annualValue: number;
  requiresAuth: boolean;
}

export const FREE_API_CONFIGS: APIConfig[] = [
  // No Auth Required - Always available
  { name: 'quickchart', category: 'Visualization', testUrl: 'https://quickchart.io/healthcheck', timeout: 3000, fallbacks: [], isFree: true, annualValue: 0, requiresAuth: false },
  { name: 'coincap', category: 'Financial', testUrl: 'https://api.coincap.io/v2/assets/bitcoin', timeout: 5000, fallbacks: ['coingecko', 'binance'], isFree: true, annualValue: 0, requiresAuth: false },
  { name: 'binance', category: 'Financial', testUrl: 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT', timeout: 3000, fallbacks: ['coincap'], isFree: true, annualValue: 0, requiresAuth: false },
  { name: 'scryfall', category: 'Gaming', testUrl: 'https://api.scryfall.com/cards/random', timeout: 5000, fallbacks: [], isFree: true, annualValue: 0, requiresAuth: false },
  { name: 'pokeapi', category: 'Gaming', testUrl: 'https://pokeapi.co/api/v2/pokemon/1', timeout: 5000, fallbacks: [], isFree: true, annualValue: 0, requiresAuth: false },
  { name: 'ip_api', category: 'Geolocation', testUrl: 'http://ip-api.com/json/8.8.8.8', timeout: 3000, fallbacks: ['ipinfo'], isFree: true, annualValue: 0, requiresAuth: false },
  { name: 'musicbrainz', category: 'Music', testUrl: 'https://musicbrainz.org/ws/2/artist/5b11f4ce-a62d-471e-81fc-a69a8278c7da?fmt=json', timeout: 5000, fallbacks: ['deezer'], isFree: true, annualValue: 0, requiresAuth: false },
  { name: 'deezer', category: 'Music', testUrl: 'https://api.deezer.com/artist/27', timeout: 3000, fallbacks: [], isFree: true, annualValue: 0, requiresAuth: false },
  { name: 'restcountries', category: 'Utilities', testUrl: 'https://restcountries.com/v3.1/name/usa', timeout: 5000, fallbacks: [], isFree: true, annualValue: 0, requiresAuth: false },
  { name: 'nasa', category: 'Government', testUrl: 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY', timeout: 5000, fallbacks: [], isFree: true, annualValue: 0, requiresAuth: false },
  // Auth Required
  { name: 'groq', category: 'AI', testUrl: 'https://api.groq.com/openai/v1/models', timeout: 5000, fallbacks: ['huggingface'], isFree: true, annualValue: 1728, requiresAuth: true },
  { name: 'newsapi', category: 'News', testUrl: 'https://newsapi.org/v2/top-headlines?country=us', timeout: 5000, fallbacks: [], isFree: true, annualValue: 180, requiresAuth: true },
  { name: 'openweathermap', category: 'Weather', testUrl: 'https://api.openweathermap.org/data/2.5/weather?q=London', timeout: 5000, fallbacks: ['noaa'], isFree: true, annualValue: 480, requiresAuth: true },
];

export async function checkAPIHealth(config: APIConfig): Promise<APIHealthStatus> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);
    
    const headers: Record<string, string> = {};
    if (config.name === 'musicbrainz') {
      headers['User-Agent'] = 'CRAudioVizAI/1.0 (royhenderson@craudiovizai.com)';
    }
    
    const response = await fetch(config.testUrl, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    
    let status: 'healthy' | 'degraded' | 'down' = 'down';
    if (response.ok) {
      status = latency < 1000 ? 'healthy' : 'degraded';
    }
    
    return {
      service: config.name,
      category: config.category,
      status,
      latency,
      lastChecked: new Date(),
      message: response.ok ? 'OK' : `HTTP ${response.status}`,
      fallback: config.fallbacks[0],
      isFree: config.isFree,
      annualValue: config.annualValue,
    };
  } catch (error) {
    return {
      service: config.name,
      category: config.category,
      status: 'down',
      latency: Date.now() - startTime,
      lastChecked: new Date(),
      message: error instanceof Error ? error.message : 'Unknown error',
      fallback: config.fallbacks[0],
      isFree: config.isFree,
      annualValue: config.annualValue,
    };
  }
}

export async function checkAllFreeAPIs(authOnly = false): Promise<APIHealthStatus[]> {
  const configs = authOnly 
    ? FREE_API_CONFIGS.filter(c => !c.requiresAuth)
    : FREE_API_CONFIGS;
  
  return Promise.all(configs.map(checkAPIHealth));
}

export async function logHealthCheck(result: APIHealthStatus): Promise<void> {
  await supabase.from('free_api_health_logs').insert({
    service_name: result.service,
    category: result.category,
    status: result.status,
    latency_ms: result.latency,
    message: result.message,
    fallback_service: result.fallback,
    is_free: result.isFree,
    annual_value: result.annualValue,
    checked_at: result.lastChecked.toISOString(),
  });
}

export async function getFailoverRecommendation(serviceName: string): Promise<string | null> {
  const { data } = await supabase
    .from('free_api_registry')
    .select('fallback_services')
    .eq('service_name', serviceName)
    .single();
  
  if (data?.fallback_services?.length) {
    const { data: healthData } = await supabase
      .from('free_api_health_logs')
      .select('service_name, status')
      .in('service_name', data.fallback_services)
      .eq('status', 'healthy')
      .order('checked_at', { ascending: false })
      .limit(1);
    
    return healthData?.[0]?.service_name || data.fallback_services[0];
  }
  
  return null;
}

export async function getTotalFreeAPIValue(): Promise<number> {
  const { data } = await supabase
    .from('free_api_registry')
    .select('annual_value')
    .eq('is_active', true);
  
  return data?.reduce((sum, r) => sum + (r.annual_value || 0), 0) || 0;
}
