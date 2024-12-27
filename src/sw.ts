const sw = self as unknown & typeof globalThis;

self.addEventListener('install', (event: any) => {
	console.log('Service Worker installing::', event);
	event.target.skipWaiting();
});
