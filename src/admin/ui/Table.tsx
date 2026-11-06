import type { ReactNode } from 'react';

export type Column<T> = { id: string; header: string; render: (row: T) => ReactNode };

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
  // Explicit roles: the narrow layout sets rows and cells to display:block, which drops the native table semantics.
  return (
    <table role="table" className="adm-table">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr role="row">
          {columns.map((c) => (
            <th key={c.id} role="columnheader" scope="col" className="label">
              {c.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={getKey(row)} role="row">
            {columns.map((c) => (
              <td key={c.id} role="cell" data-label={c.header}>
                {c.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
