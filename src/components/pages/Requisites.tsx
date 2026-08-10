"use client";

/**
 * Legal requisites block at the foot of /about (TZ #10 §3).
 *
 * The CMS stores the block as plain text, one entry per line. Lines shaped
 * `Label: value` become a definition-list row (label left, value right on
 * desktop); a line without a colon — the entity name — becomes a full-width
 * lead row. That keeps the field editable as a textarea while giving the
 * visitor scannable rows instead of the old single `<pre>` blob.
 */

interface Entry {
  label: string | null;
  value: string;
}

/** Split each line at its first colon. Later colons ("МФО: 305299") stay in
 *  the value, which is what we want — they belong to the same fact. */
function parseRequisites(raw: string): Entry[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return { label: null, value: line };
      const label = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      // A colon with nothing after it isn't a label/value pair.
      if (!label || !value) return { label: null, value: line };
      return { label, value };
    });
}

export default function Requisites({ raw, heading }: { raw: string; heading?: string }) {
  const entries = parseRequisites(raw);
  if (!entries.length) return null;

  return (
    <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-16">
      <div className="border-t border-black-10 pt-10">
        {heading && (
          <h2 className="body-strong text-black-70 mb-5 text-sm uppercase tracking-wider">
            {heading}
          </h2>
        )}
        <dl className="max-w-3xl">
          {entries.map((entry, i) =>
            entry.label === null ? (
              <p key={i} className="body-strong text-black-80 mb-4 leading-relaxed">
                {entry.value}
              </p>
            ) : (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:gap-6 py-2.5 border-t border-black-10 first-of-type:border-t-0"
              >
                <dt className="body-s text-black-50 sm:w-56 sm:shrink-0 leading-relaxed">
                  {entry.label}
                </dt>
                <dd className="body-s text-black-70 leading-relaxed break-words">
                  {entry.value}
                </dd>
              </div>
            ),
          )}
        </dl>
      </div>
    </div>
  );
}
