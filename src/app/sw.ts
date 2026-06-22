/// <reference lib="webworker" />
import { defaultCache } from '@serwist/next/worker'
import { NetworkFirst, StaleWhileRevalidate, Serwist } from 'serwist'

declare const self: ServiceWorkerGlobalScope & { __SW_MANIFEST: string[] }

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url }) => url.pathname.startsWith('/_next/static'),
      handler: new StaleWhileRevalidate(),
    },
    {
      matcher: ({ request }) => request.mode === 'navigate',
      handler: new NetworkFirst({ networkTimeoutSeconds: 5 }),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [{ url: '/offline', matcher: ({ request }) => request.mode === 'navigate' }],
  },
})

serwist.addEventListeners()
