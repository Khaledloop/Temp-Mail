import {ImageResponse} from 'next/og'

export const runtime = 'edge'
export const alt = 'Temp Mail Lab - Disposable inboxes in seconds'
export const size = {
  width: 1200,
  height: 628,
}
export const contentType = 'image/png'

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px',
          background: 'linear-gradient(140deg, #0f172a 0%, #1e293b 48%, #334155 100%)',
          color: '#f8fafc',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 14, fontSize: 30, fontWeight: 700}}>
          <div
            style={{
              display: 'flex',
              width: 52,
              height: 52,
              borderRadius: 14,
              background: '#f8fafc',
              color: '#0f172a',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              fontWeight: 800,
            }}
          >
            T
          </div>
          Temp Mail Lab
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
          <div style={{fontSize: 62, lineHeight: 1.05, fontWeight: 800, letterSpacing: '-0.03em'}}>
            Disposable Email.
          </div>
          <div style={{fontSize: 62, lineHeight: 1.05, fontWeight: 800, letterSpacing: '-0.03em'}}>
            Zero Signup.
          </div>
          <div style={{fontSize: 28, color: '#cbd5e1', maxWidth: 900}}>
            Create an anonymous inbox instantly and keep your personal email private.
          </div>
        </div>

        <div style={{display: 'flex', fontSize: 23, fontWeight: 600, color: '#e2e8f0'}}>
          tempmaillab.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
