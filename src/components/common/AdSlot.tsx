/**
 * Ad slot component for AdSense placement
 */

'use client';

export function AdSlot({ slot = 'top' }: { slot?: 'top' | 'middle' | 'bottom' }) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  if (!adsenseId) {
    return (
      <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-8 text-sm text-gray-500">
        {`<!-- AdSense ${slot} -->`}
      </div>
    );
  }

  return (
    <div className="my-6">
      {/* Google AdSense placeholder */}
      <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 py-8">
        <p className="text-sm text-gray-500">Advertisement</p>
      </div>
    </div>
  );
}
