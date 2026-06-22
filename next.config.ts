import type { NextConfig } from 'next'
import withSerwist from '@serwist/next'

const nextConfig: NextConfig = {
  turbopack: {},
  allowedDevOrigins: ['192.168.0.81'],
}

const withSerwistConfig = withSerwist({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
})

export default withSerwistConfig(nextConfig)
