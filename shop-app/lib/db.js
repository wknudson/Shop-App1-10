const postgres = require("postgres");

const sql = postgres(process.env.DATABASE_URL, {
  ssl: "require",
});

// SQLite uses ? for placeholders; PostgreSQL uses $1, $2, etc.
function convertPlaceholders(query) {
  let index = 0;
  return query.replace(/\?/g, () => `$${++index}`);
}

async function all(query, params = []) {
  const rows = await sql.unsafe(convertPlaceholders(query), params);
  return [...rows];
}

async function get(query, params = []) {
  const rows = await sql.unsafe(convertPlaceholders(query), params);
  return rows[0] ?? null;
}

async function run(query, params = []) {
  const rows = await sql.unsafe(convertPlaceholders(query), params);
  return { changes: rows.count };
}

module.exports = { all, get, run, sql };
