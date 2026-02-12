'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

const VIGNETTE_SRC = 'https://gizokraijaw.net/vignette.min.js'
const VIGNETTE_ZONE = '10603056'

export function DeferredVignette() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (ready) return

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
  }, [ready])

  if (!ready) return null

  return (
    <Script
      id="monetag-vignette"
      src={VIGNETTE_SRC}
      data-zone={VIGNETTE_ZONE}
      strategy="afterInteractive"
    />
  )
}
