import type { SectionCompareTable } from "@/sanity/types";

export default function CompareTableSection({ heading, columns, rows }: SectionCompareTable) {
  return (
    <section>
      {heading && <h2 className="heading-2 text-black mb-6">{heading}</h2>}
      {columns?.length > 0 && rows?.length > 0 && (
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full border-collapse min-w-[480px]">
            <thead>
              <tr>
                <th className="text-left body-strong text-black py-3 pr-4 border-b border-line" />
                {columns.map((col, i) => (
                  <th key={i} className="text-left body-strong text-black py-3 px-4 border-b border-line">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  <td className="body-strong text-black py-3 pr-4 border-b border-line/50">
                    {row.label}
                  </td>
                  {row.values?.map((val, vi) => (
                    <td key={vi} className="body-l text-muted py-3 px-4 border-b border-line/50">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
