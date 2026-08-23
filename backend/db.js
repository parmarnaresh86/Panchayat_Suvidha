const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const dbPath = process.env.DB_FILE
    ? path.resolve(__dirname, process.env.DB_FILE)
    : path.resolve(__dirname, 'database.sqlite');

const database = new Database(dbPath);
database.pragma('journal_mode = WAL');
database.pragma('foreign_keys = ON');

const schemaPath = path.resolve(__dirname, 'schema.sql');
if (fs.existsSync(schemaPath)) {
    database.exec(fs.readFileSync(schemaPath, 'utf8'));
}

// `CREATE TABLE IF NOT EXISTS` above only handles brand-new databases —
// columns added to schema.sql later need an explicit migration for
// databases that already existed. Kept as simple, additive, idempotent
// ALTER TABLEs; safe to run on every startup.
const villageColumns = database.prepare("PRAGMA table_info(Village)").all().map(c => c.name);
if (!villageColumns.includes('theme')) {
    database.exec("ALTER TABLE Village ADD COLUMN theme TEXT NOT NULL DEFAULT 'classic'");
}

// Kept so existing `.input(name, sql.NVarChar, value)` call sites (written
// for the old mssql driver) keep working unchanged against sqlite.
const textType = () => 'TEXT';
const sql = {
    Int: 'INTEGER',
    Bit: 'INTEGER',
    NVarChar: textType,
    VarChar: textType,
    DateTime: 'TEXT',
    MAX: 'MAX'
};

class Request {
    constructor(db) {
        this.db = db;
        this.params = {};
    }

    // Every call site in this codebase uses the 3-arg mssql form
    // `.input(name, type, value)` — never the 2-arg `.input(name, value)`
    // form, so there's no ambiguity to resolve here. (Detecting the 2-arg
    // form via `value !== undefined` breaks the moment a caller explicitly
    // passes `undefined` as the value — the type marker itself would be
    // mistaken for the value and fail to bind.)
    input(name, type, value) {
        if ((type === sql.Int || type === sql.Bit) && value !== null && value !== undefined) {
            value = Number(value);
        }

        this.params[name] = value === undefined ? null : value;
        return this;
    }

    query(text) {
        const statements = text
            .split(';')
            .map(s => s.trim())
            .filter(Boolean);

        const recordsets = [];
        const rowsAffected = [];
        let lastInsertRowid = null;

        for (const statement of statements) {
            const stmt = this.db.prepare(statement);
            if (stmt.reader) {
                recordsets.push(stmt.all(this.params));
            } else {
                const info = stmt.run(this.params);
                rowsAffected.push(info.changes);
                lastInsertRowid = info.lastInsertRowid;
            }
        }

        return {
            recordset: recordsets[0] || [],
            recordsets,
            rowsAffected,
            lastInsertRowid
        };
    }
}

const poolPromise = Promise.resolve({
    request: () => new Request(database)
});

module.exports = { sql, poolPromise, db: database };
