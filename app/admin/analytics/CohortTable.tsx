type Cohort = {
  slug: string;
  name: string;
  cohortSize: number;
  followUps: { slug: string; name: string; attended: number; retentionPct: number }[];
};

export default function CohortTable({ cohorts }: { cohorts: Cohort[] }) {
  if (cohorts.length < 2) {
    return (
      <p className="rounded-2xl border border-marigold-200/60 bg-cream-50 p-5 text-sm text-ink-mute">
        Cohort retention shows up once 2+ events have run. Right now you have{' '}
        {cohorts.length} event with attendees.
      </p>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-marigold-200/60 bg-cream-50">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-cream-100 text-left text-[11px] uppercase tracking-wider text-ink-mute">
            <tr>
              <th className="p-3">Cohort (Vol N)</th>
              <th className="p-3">Size</th>
              {cohorts[0].followUps.map((f) => (
                <th key={f.slug} className="p-3">
                  → {f.name.split(' ')[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map((c) => (
              <tr key={c.slug} className="border-t border-marigold-100 text-sm">
                <td className="p-3 font-display">{c.name}</td>
                <td className="p-3">{c.cohortSize}</td>
                {c.followUps.map((f) => (
                  <td key={f.slug} className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        f.retentionPct >= 30
                          ? 'bg-leaf/15 text-emerald-700'
                          : f.retentionPct >= 10
                            ? 'bg-marigold-100 text-marigold-700'
                            : 'bg-ink/5 text-ink-mute'
                      }`}
                    >
                      {f.attended} · {f.retentionPct}%
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
