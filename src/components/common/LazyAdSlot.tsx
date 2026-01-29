/**
 * Lazy-loaded AdSlot to avoid blocking initial render.
 */

'use client';

import dynamic from 'next/dynamic';

export const LazyAdSlot = dynamic(
  () => import('@/components/common/AdSlot').then((mod) => mod.AdSlot),
  { ssr: false }
);
