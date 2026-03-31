import { all } from "../../../lib/db";

export const dynamic = "force-dynamic";

export default function SchemaPage() {
  const tables = all(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
  );

  const schema = tables.map((t) => ({
    name: t.name,
    columns: all(`PRAGMA table_info("${t.name}")`),
  }));

  return (
    <>
      <h1>Database Schema (Debug)</h1>
      <p className="text-muted mb-3">
        Tables found in shop.db — use this to verify column names for your queries.
      </p>
      {schema.map((table) => (
        <div key={table.name} className="card">
          <h3 className="mb-1">{table.name}</h3>
          <table>
            <thead>
              <tr>
                <th>CID</th>
                <th>Column Name</th>
                <th>Type</th>
                <th>Not Null</th>
                <th>Default</th>
                <th>PK</th>
              </tr>
            </thead>
            <tbody>
              {table.columns.map((col) => (
                <tr key={col.cid}>
                  <td>{col.cid}</td>
                  <td><strong>{col.name}</strong></td>
                  <td>{col.type || "—"}</td>
                  <td>{col.notnull ? "YES" : "no"}</td>
                  <td>{col.dflt_value ?? "—"}</td>
                  <td>{col.pk ? "✓" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
}
