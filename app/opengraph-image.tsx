import {ImageResponse} from 'next/og'

export const runtime = 'edge'
export const alt = 'Temp Mail Lab - Free Temporary Email Address'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          background:
            'radial-gradient(circle at 20% 20%, #e0f2fe 0%, #dbeafe 35%, #bfdbfe 100%)',
          color: '#0f172a',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          <div
            style={{
              display: 'flex',
              width: 56,
              height: 56,
              borderRadius: 16,
              background: '#111827',
              color: '#ffffff',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            T
          </div>
          Temp Mail Lab
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
          <div style={{fontSize: 66, fontWeight: 800, lineHeight: 1.04, letterSpacing: '-0.03em'}}>
            Free Temporary Email Address
          </div>
          <div style={{fontSize: 30, color: '#334155', maxWidth: 980}}>
            Instant disposable inboxes with no signup. Protect your real email from spam.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 24,
            color: '#1e293b',
            fontWeight: 600,
          }}
        >
          tempmaillab.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
