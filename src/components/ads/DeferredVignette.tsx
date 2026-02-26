'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

const ENABLE_VIGNETTE = process.env.NEXT_PUBLIC_ENABLE_VIGNETTE === 'true'
const VIGNETTE_SRC = process.env.NEXT_PUBLIC_VIGNETTE_SRC || ''
const VIGNETTE_ZONE = process.env.NEXT_PUBLIC_VIGNETTE_ZONE || ''

function isSafeVignetteConfig(): boolean {
  if (!ENABLE_VIGNETTE) return false
  if (!/^https:\/\/[a-z0-9.-]+\/[^\s]+$/i.test(VIGNETTE_SRC)) return false
  if (!/^\d+$/.test(VIGNETTE_ZONE)) return false
  return true
}

export function DeferredVignette() {
  const safeConfig = isSafeVignetteConfig()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!safeConfig || ready) return

    const trigger = () => {
      setReady(true)
    }

    const onScroll = () => {
      trigger()
      cleanup()
    }

    const onPointer = () => {
      trigger()
      cleanup()
    }

    const onKey = () => {
      trigger()
      cleanup()
    }

    const cleanup = () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey)

    return cleanup
  }, [ready, safeConfig])

  if (!safeConfig || !ready) return null

  return (
    <Script
      id="monetag-vignette"
      src={VIGNETTE_SRC}
      data-zone={VIGNETTE_ZONE}
      strategy="afterInteractive"
    />
  )
}
