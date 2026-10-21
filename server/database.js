const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const dbPath = path.resolve(process.cwd(), "users.db");

let db;
let initPromise;

function columns(table) {
    const result = db.exec(`PRAGMA table_info("${table}")`);
    return result.length ? result[0].values.map(row => row[1]) : [];
}

function addColumnIfMissing(table, column, definition) {
    if (!columns(table).includes(column)) {
        db.run(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${definition}`);
    }
}

function saveDatabase() {
    const tempPath = `${dbPath}.tmp`;
    fs.writeFileSync(tempPath, Buffer.from(db.export()));
    fs.renameSync(tempPath, dbPath);
}

async function init() {
    if (db) return;
    if (initPromise) return initPromise;

    initPromise = (async () => {
        const SQL = await initSqlJs({
            locateFile: file =>
                path.join(path.dirname(require.resolve("sql.js")), file)
        });

        if (fs.existsSync(dbPath)) {
            db = new SQL.Database(fs.readFileSync(dbPath));
        } else {
            db = new SQL.Database();
        }

        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                username TEXT UNIQUE,
                first_name TEXT,
                last_name TEXT,
                avatar TEXT,
                password TEXT,
                created_at TEXT,
                push_token TEXT
            );

            CREATE TABLE IF NOT EXISTS chats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT
            );

            CREATE TABLE IF NOT EXISTS chat_members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                chat_id INTEGER,
                user_id INTEGER,
                last_read INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                chat_id INTEGER,
                sender_id INTEGER,
                text TEXT,
                created_at TEXT,
                read INTEGER DEFAULT 0
            );
        `);

        addColumnIfMissing("users", "username", "TEXT");
        addColumnIfMissing("users", "avatar", "TEXT");
        addColumnIfMissing("users", "push_token", "TEXT");
        addColumnIfMissing("messages", "read", "INTEGER DEFAULT 0");
        addColumnIfMissing("chat_members", "last_read", "INTEGER DEFAULT 0");

        const chatColumns = columns("chats");

        if (chatColumns.includes("user1") && chatColumns.includes("user2")) {
            db.run("BEGIN TRANSACTION");

            try {
                db.run(`
                    CREATE TABLE chats_new (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        created_at TEXT
                    );

                    INSERT INTO chats_new (id, created_at)
                    SELECT id, created_at FROM chats;

                    INSERT INTO chat_members (chat_id, user_id)
                    SELECT c.id, c.user1
                    FROM chats c
                    WHERE c.user1 IS NOT NULL
                      AND NOT EXISTS (
                        SELECT 1 FROM chat_members m
                        WHERE m.chat_id = c.id AND m.user_id = c.user1
                      );

                    INSERT INTO chat_members (chat_id, user_id)
                    SELECT c.id, c.user2
                    FROM chats c
                    WHERE c.user2 IS NOT NULL
                      AND c.user2 != c.user1
                      AND NOT EXISTS (
                        SELECT 1 FROM chat_members m
                        WHERE m.chat_id = c.id AND m.user_id = c.user2
                      );

                    DROP TABLE chats;
                    ALTER TABLE chats_new RENAME TO chats;
                `);

                db.run("COMMIT");
            } catch (error) {
                db.run("ROLLBACK");
                throw error;
            }
        }

        saveDatabase();
    })();

    try {
        await initPromise;
    } catch (error) {
        db = undefined;
        throw error;
    } finally {
        initPromise = undefined;
    }
}

async function query(sql) {
    if (!db) {
        throw new Error("Database is not initialized. Call database.init() first.");
    }

    const statement = db.prepare(sql);
    const rows = [];

    try {
        while (statement.step()) {
            rows.push(statement.getAsObject());
        }
    } finally {
        statement.free();
    }

    return rows;
}

async function run(sql) {
    if (!db) {
        throw new Error("Database is not initialized. Call database.init() first.");
    }

    db.run(sql);
    saveDatabase();
    return true;
}

module.exports = { init, query, run };
