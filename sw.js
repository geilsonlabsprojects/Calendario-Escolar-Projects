/**
 * Service Worker - Horário Escolar 2026
 * Estratégia: Cache First (Prioridade Total ao Offline)
 */

const CACHE_NAME = 'horario-permanente-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18/umd/react.development.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://unpkg.com/lucide@latest'
];

// Instalação: Salva todos os ficheiros críticos imediatamente
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache prioritário criado com sucesso.');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Ativação: Remove caches antigos de versões anteriores
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Interceção de Pedidos: A lógica infalível para o Offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. Se estiver no cache, entrega IMEDIATAMENTE (super rápido)
      if (cachedResponse) {
        return cachedResponse;
      }

      // 2. Se não estiver no cache, tenta buscar na rede
      return fetch(event.request).then((networkResponse) => {
        // Valida se a resposta é válida antes de guardar
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Guarda uma cópia do novo ficheiro no cache para uso futuro
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // 3. Se falhar rede e não houver cache (ex: imagens externas), retorna erro silencioso
        console.error('Falha de rede e ficheiro não disponível em cache.');
      });
    })
  );
});
