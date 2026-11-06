import type { ReactNode } from 'react';

export type Column<T> = { key: string; header: string; render: (row: T) => ReactNode };

export default function Table<T>({
  caption,
  columns,
  rows,
  getKey,
}: {
  caption: string;
  columns: Column<T>[];
  rows: readonly T[];
  getKey: (row: T) => string;
}) {
  return (
    <table className="adm-table">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} scope="col" className="label">
              {c.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={getKey(row)}>
            {columns.map((c) => (
              <td key={c.key} data-label={c.header}>
                {c.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
