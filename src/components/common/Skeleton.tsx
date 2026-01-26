/**
 * Loading skeleton component for email list items
 */

'use client';

export function EmailSkeleton() {
  return (
    <div className="animate-pulse border-b border-gray-200 p-4">
      <div className="space-y-3">
        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
        <div className="h-3 w-full rounded bg-gray-200"></div>
        <div className="h-3 w-2/3 rounded bg-gray-200"></div>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for email detail view
 */
export function EmailDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 w-3/4 rounded bg-gray-200"></div>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-gray-200"></div>
          <div className="h-3 w-24 rounded bg-gray-200"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 w-full rounded bg-gray-200"></div>
        <div className="h-3 w-full rounded bg-gray-200"></div>
        <div className="h-3 w-2/3 rounded bg-gray-200"></div>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for hero section
 */
export function HeroSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-2/3 rounded bg-gray-200"></div>
      <div className="h-16 w-full rounded-lg bg-gray-200"></div>
      <div className="flex gap-3">
        <div className="h-10 flex-1 rounded-lg bg-gray-200"></div>
        <div className="h-10 w-24 rounded-lg bg-gray-200"></div>
      </div>
    </div>
  );
}
