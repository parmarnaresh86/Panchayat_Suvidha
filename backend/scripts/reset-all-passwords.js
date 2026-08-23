// One-off: resets every existing Users row's password to a known value
// (bcrypt-hashed properly, not stored in plaintext) across every village.
const path = require('path');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

const NEW_PASSWORD = process.argv[2] || 'password';
const db = new Database(path.resolve(__dirname, '..', 'database.sqlite'));

(async () => {
    const hash = await bcrypt.hash(NEW_PASSWORD, 10);
    const users = db.prepare(`
        SELECT u.id, u.username, u.role, v.slug AS village_slug
        FROM Users u JOIN Village v ON v.id = u.village_id
    `).all();

    const update = db.prepare('UPDATE Users SET password = ? WHERE id = ?');
    for (const u of users) {
        update.run(hash, u.id);
        console.log(`${u.village_slug}: ${u.username} (${u.role}) -> password reset`);
    }

    if (users.length === 0) {
        console.log('No Users rows found.');
    }
})();
