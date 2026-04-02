import { all } from "../../../lib/db";

export const dynamic = "force-dynamic";

export default async function SchemaPage() {
  const tables = await all(
    `SELECT table_name AS name
     FROM information_schema.tables
     WHERE table_schema = 'public'
     ORDER BY table_name`
  );

  const schema = [];
  for (const t of tables) {
    const columns = await all(
      `SELECT ordinal_position, column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = ?
       ORDER BY ordinal_position`,
      [t.name]
    );
    schema.push({ name: t.name, columns });
  }

  return (
    <>
      <h1>Database Schema (Debug)</h1>
      <p className="text-muted mb-3">
        Tables found in Supabase — use this to verify column names for your queries.
      </p>
      {schema.map((table) => (
        <div key={table.name} className="card">
          <h3 className="mb-1">{table.name}</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Column Name</th>
                <th>Type</th>
                <th>Nullable</th>
                <th>Default</th>
              </tr>
            </thead>
            <tbody>
              {table.columns.map((col) => (
                <tr key={col.ordinal_position}>
                  <td>{col.ordinal_position}</td>
                  <td><strong>{col.column_name}</strong></td>
                  <td>{col.data_type || "—"}</td>
                  <td>{col.is_nullable === "NO" ? "NOT NULL" : "yes"}</td>
                  <td>{col.column_default ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
}
