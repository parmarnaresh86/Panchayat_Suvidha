const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.resolve(__dirname, '..', 'database.sqlite'));

const historyGu = 'કુકાવાવ ગુજરાતના અમરેલી જિલ્લાના સાવરકુંડલા તાલુકામાં સૌરાષ્ટ્ર વિસ્તારમાં આવેલું છે. તેનું વહીવટ ખલપર-કુકાવાવ ગ્રામ પંચાયત દ્વારા થાય છે અને ગામ જાહેર બસ સેવા દ્વારા સાવરકુંડલા શહેર (લગભગ ૨૭ કિમી દૂર) સાથે જોડાયેલું છે.';

const info = db.prepare('UPDATE Village SET history_gu = ? WHERE slug = ?').run(historyGu, 'kukavav');
console.log(`Updated ${info.changes} row(s).`);

const row = db.prepare('SELECT history_gu FROM Village WHERE slug = ?').get('kukavav');
console.log(row.history_gu);
