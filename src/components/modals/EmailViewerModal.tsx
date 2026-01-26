/**
 * Email Viewer Modal component
 */

'use client';

import { useUiStore } from '@/store/uiStore';
import { useInboxStore } from '@/store/inboxStore';
import { EmailViewer } from '@/components/EmailViewer/EmailViewer';

export function EmailViewerModal() {
  const { isEmailViewerOpen, closeEmailViewer } = useUiStore();
  const { getSelectedEmail } = useInboxStore();

  const selectedEmail = getSelectedEmail();

  if (!isEmailViewerOpen || !selectedEmail) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={closeEmailViewer}
      />

      {/* Modal */}
      <div className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl z-50">
        <div className="h-full sm:h-auto sm:max-h-[90vh] overflow-hidden">
          <EmailViewer
            email={selectedEmail}
            onClose={closeEmailViewer}
          />
        </div>
      </div>
    </>
  );
}
