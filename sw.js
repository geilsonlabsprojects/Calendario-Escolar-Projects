const CACHE_NAME = 'horario-escolar-v2-offline'; // Atualizei a versão
const ASSETS = [
  './',
  './index.html',
  // Bibliotecas Externas (Essenciais para funcionar offline)
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18/umd/react.development.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://unpkg.com/lucide@latest'
];

// 1. Instalação: Baixa e guarda TUDO o que é necessário
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Força o SW a ativar imediatamente
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all assets');
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Ativação: Limpa caches antigos para não acumular lixo
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// 3. Interceptação de Requisições (Estratégia Híbrida)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Se encontrou no cache, retorna o cache (velocidade/offline)
      if (cachedResponse) {
        return cachedResponse;
      }

      // Se não, tenta buscar na rede
      return fetch(event.request).then((networkResponse) => {
        // Verifica se a resposta é válida
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            // Nota: Para recursos de terceiros (CORS), type pode ser 'cors' ou 'opaque'.
            // Vamos permitir cachear recursos externos se a requisição foi bem sucedida.
            if (!networkResponse || networkResponse.status !== 200) {
                return networkResponse;
            }
        }

        // Se baixou da rede com sucesso, salva uma cópia no cache para a próxima vez
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});
