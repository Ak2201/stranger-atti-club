'use client';

import { useTransition } from 'react';
import { deleteEventAction } from './actions';

export default function DeleteEventButton({
  slug,
  name,
  bookingsCount,
}: {
  slug: string;
  name: string;
  bookingsCount: number;
}) {
  const [pending, startTransition] = useTransition();

  function handle() {
    const warn =
      bookingsCount > 0
        ? `Delete "${name}"? This event has ${bookingsCount} booking${bookingsCount === 1 ? '' : 's'}. Bookings will keep their data but lose the event reference. Type DELETE to confirm.`
        : `Delete "${name}"? This can't be undone.`;
    const ok = confirm(warn);
    if (!ok) return;
    startTransition(async () => {
      await deleteEventAction(slug);
    });
  }

  return (
    <button
      onClick={handle}
      disabled={pending}
      className="text-crimson hover:underline disabled:opacity-50"
    >
      {pending ? 'Deleting…' : 'Delete'}
    </button>
  );
}
