import Database from 'better-sqlite3';

const db = new Database('economy.db');

// Users table
db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    balance INTEGER NOT NULL DEFAULT 0,
    bank INTEGER NOT NULL DEFAULT 0,
    loan INTEGER NOT NULL DEFAULT 0,
    vip_level INTEGER NOT NULL DEFAULT 0,
    last_daily INTEGER,
    last_weekly INTEGER,
    last_monthly INTEGER,
    last_work INTEGER,
    last_rob INTEGER,
    last_crime INTEGER,
    bank_limit INTEGER
);
`);

// Inventory table
db.exec(`
CREATE TABLE IF NOT EXISTS inventory (
    user_id TEXT,
    item_id TEXT,
    amount INTEGER DEFAULT 1,
    PRIMARY KEY (user_id, item_id)
);
`);

// Active effects table
db.exec(`
CREATE TABLE IF NOT EXISTS active_effects (
    user_id TEXT,
    effect_id TEXT,
    expires_at INTEGER,
    PRIMARY KEY (user_id, effect_id)
);
`);

try {
    db.exec(`ALTER TABLE users ADD COLUMN spinCooldown INTEGER DEFAULT 0;`);
} catch (e) {}

try {
    db.exec(`ALTER TABLE users ADD COLUMN jackpotTickets INTEGER DEFAULT 0;`);
} catch (e) {}

export function getUser(id) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    let user = stmt.get(id);

    if (!user) {
        db.prepare('INSERT INTO users (id) VALUES (?)').run(id);
        user = stmt.get(id);
    }

    return user;
}

export function updateBalance(id, amount) {
    const user = getUser(id);
    const newBalance = Math.max(0, user.balance + amount);
    db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(newBalance, id);
    return newBalance;
}

export function updateBank(id, amount) {
    const user = getUser(id);
    const newBank = user.bank + amount;

    // Check bank limit
    if (newBank > user.bank_limit) {
        return false; // limit exceeded
    }

    const finalBank = Math.max(0, newBank);

    db.prepare('UPDATE users SET bank = ? WHERE id = ?').run(finalBank, id);
    return finalBank;
}

export function updateUser(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const setString = keys.map(k => `${k} = ?`).join(', ');
    db.prepare(`UPDATE users SET ${setString} WHERE id = ?`).run(...values, id);
}

export function addEffect(userId, effectId, durationSeconds) {
    const expires = Math.floor(Date.now() / 1000) + durationSeconds;

    db.prepare(`
    INSERT INTO active_effects (user_id, effect_id, expires_at)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, effect_id)
    DO UPDATE SET expires_at = ?
    `).run(userId, effectId, expires, expires);
}

export function hasEffect(userId, effectId) {
    const row = db.prepare(`
    SELECT expires_at FROM active_effects
    WHERE user_id = ? AND effect_id = ?
    `).get(userId, effectId);

    if (!row) return false;

    const now = Math.floor(Date.now() / 1000);

    if (row.expires_at < now) {
        db.prepare(`
        DELETE FROM active_effects
        WHERE user_id = ? AND effect_id = ?
        `).run(userId, effectId);
        return false;
    }

    return true;
}

export function removeEffect(userId, effectId) {
    db.prepare(`
    DELETE FROM active_effects
    WHERE user_id = ? AND effect_id = ?
    `).run(userId, effectId);
}

export function getEffects(userId) {
    return db.prepare(`
    SELECT effect_id, expires_at
    FROM active_effects
    WHERE user_id = ?
    `).all(userId);
}

export function getCooldown(userId, type) {
    const user = getUser(userId);
    const last = user[`last_${type}`];

    if (!last) return 0;

    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, last - now);
}

export function setCooldown(userId, type, seconds) {
    const expires = Math.floor(Date.now() / 1000) + seconds;

    db.prepare(`
    UPDATE users
    SET last_${type} = ?
    WHERE id = ?
    `).run(expires, userId);
}

export function addItem(userId, itemId, amount = 1) {
    const existing = db.prepare(`
    SELECT amount FROM inventory
    WHERE user_id = ? AND item_id = ?
    `).get(userId, itemId);

    if (existing) {
        db.prepare(`
        UPDATE inventory
        SET amount = amount + ?
        WHERE user_id = ? AND item_id = ?
        `).run(amount, userId, itemId);
    } else {
        db.prepare(`
        INSERT INTO inventory (user_id, item_id, amount)
        VALUES (?, ?, ?)
        `).run(userId, itemId, amount);
    }
}

export function saveUser(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const setString = keys.map(k => `${k} = ?`).join(', ');

    db.prepare(`
    UPDATE users
    SET ${setString}
    WHERE id = ?
    `).run(...values, id);
}

export default db;
