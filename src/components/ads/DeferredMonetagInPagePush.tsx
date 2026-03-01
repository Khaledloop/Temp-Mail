'use client'

import { useEffect } from 'react'

const MONETAG_SRC = 'https://5gvci.com/act/files/tag.min.js?z=10668095'
const MONETAG_SCRIPT_ID = 'monetag-inpage-push'
const FALLBACK_DELAY_MS = 8000

function queueIdle(task: () => void): () => void {
  if (typeof window === 'undefined') return () => {}

  const withIdle = window as Window & {
    requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number
    cancelIdleCallback?: (handle: number) => void
  }

  if (withIdle.requestIdleCallback && withIdle.cancelIdleCallback) {
    const id = withIdle.requestIdleCallback(() => task(), { timeout: 10000 })
    return () => withIdle.cancelIdleCallback!(id)
  }

  const id = window.setTimeout(task, 1200)
  return () => window.clearTimeout(id)
}

export function DeferredMonetagInPagePush() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.location.pathname.startsWith('/studio')) return
    if (document.getElementById(MONETAG_SCRIPT_ID)) return

    let cancelled = false
    let loaded = false
    let cleanupIdle: (() => void) | null = null
    let fallbackTimer: number | null = null

    const injectScript = () => {
      if (cancelled || loaded) return

      try {
        const srcUrl = new URL(MONETAG_SRC)
        if (srcUrl.protocol !== 'https:' || srcUrl.hostname !== '5gvci.com') return
      } catch {
        return
      }

      const parent = [document.documentElement, document.body].filter(Boolean).pop()
      if (!parent) return

      loaded = true
      const script = document.createElement('script')
      script.id = MONETAG_SCRIPT_ID
      script.src = MONETAG_SRC
      script.async = true
      script.defer = true
      script.setAttribute('data-cfasync', 'false')
      script.referrerPolicy = 'strict-origin-when-cross-origin'
      parent.appendChild(script)
    }

    const scheduleInjection = () => {
      cleanupIdle?.()
      cleanupIdle = queueIdle(injectScript)
    }

    const onFirstInteraction = () => {
      removeInteractionListeners()
      scheduleInjection()
    }

    const removeInteractionListeners = () => {
      window.removeEventListener('pointerdown', onFirstInteraction)
      window.removeEventListener('keydown', onFirstInteraction)
      window.removeEventListener('scroll', onFirstInteraction)
    }

    const activate = () => {
      if (cancelled) return

      window.addEventListener('pointerdown', onFirstInteraction, { passive: true, once: true })
      window.addEventListener('keydown', onFirstInteraction, { once: true })
      window.addEventListener('scroll', onFirstInteraction, { passive: true, once: true })

      fallbackTimer = window.setTimeout(() => {
        removeInteractionListeners()
        scheduleInjection()
      }, FALLBACK_DELAY_MS)
    }

    if (document.readyState === 'complete') {
      activate()
    } else {
      window.addEventListener('load', activate, { once: true })
    }

    return () => {
      cancelled = true
      cleanupIdle?.()
      removeInteractionListeners()
      window.removeEventListener('load', activate)
      if (fallbackTimer !== null) {
        window.clearTimeout(fallbackTimer)
      }
    }
  }, [])

  return null
}
