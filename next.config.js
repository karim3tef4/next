/** @type {import('next').NextConfig} */
const headers = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // camera + geolocation are needed for verified visits
  { key: 'Permissions-Policy', value: 'camera=(self), geolocation=(self), microphone=()' },
];

module.exports = {
  poweredByHeader: false,
  experimental: { serverActions: { bodySizeLimit: '6mb' } },
  async headers() { return [{ source: '/(.*)', headers }]; },
};
