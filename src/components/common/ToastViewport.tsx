'use client';

import { useUiStore } from '@/store/uiStore';

function toastClass(type: 'success' | 'error' | 'info' | 'warning'): string {
  if (type === 'success') return 'border-emerald-300 bg-emerald-50 text-emerald-900';
  if (type === 'error') return 'border-red-300 bg-red-50 text-red-900';
  if (type === 'warning') return 'border-amber-300 bg-amber-50 text-amber-900';
  return 'border-slate-300 bg-white text-slate-900';
}

export function ToastViewport() {
  const { toasts, removeToast } = useUiStore();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-3 top-20 z-[70] flex w-[min(92vw,26rem)] flex-col gap-2 sm:right-5 sm:top-24">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-lg ring-1 ring-black/5 ${toastClass(toast.type)}`}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold leading-6">{toast.message}</p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="rounded-full border border-black/10 px-2 py-0.5 text-xs font-bold hover:bg-black/5"
              aria-label="Dismiss notification"
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
