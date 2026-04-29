'use client';

import { useRouter } from 'next/navigation';

type Props = {
  events: { slug: string; name: string; date: string }[];
  defaultSlug: string;
};

export default function EventPicker({ events, defaultSlug }: Props) {
  const router = useRouter();
  return (
    <select
      defaultValue={defaultSlug}
      onChange={(e) => {
        const url = new URL(window.location.href);
        url.searchParams.set('event', e.target.value);
        router.push(url.pathname + '?' + url.searchParams.toString());
      }}
      className="rounded-xl border border-marigold-200 bg-white px-3 py-2 text-sm"
    >
      {events.map((e) => (
        <option key={e.slug} value={e.slug}>
          {e.name} — {e.date}
        </option>
      ))}
    </select>
  );
}
