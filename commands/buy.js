import { SlashCommandBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';
import db from '../db.js';
import { items } from './shop.js';

export const data = new SlashCommandBuilder()
.setName('buy')
.setDescription('Buy an item from the shop')
.addStringOption(opt =>
opt.setName('id')
.setDescription('ID of the item')
.setRequired(true)
);

export async function execute(interaction) {
    const userId = interaction.user.id;
    const itemId = interaction.options.getString('id');
    const user = getUser(userId);

    const item = items.find(i => i.id === itemId);
    if (!item) return interaction.reply("❌ Invalid item.");

    if (user.balance < item.price)
        return interaction.reply("❌ You don’t have enough money.");

    // 🟡 VIP items
    if (item.id.startsWith("vip")) {
        const newLevel = Number(item.id.replace("vip", ""));

        if (newLevel > 5) {
            return interaction.reply("❌ The maximum VIP level is 5.");
        }

        if (user.vip_level >= newLevel) {
            return interaction.reply("❌ You already have this VIP level or higher.");
        }

        // Update VIP level
        db.prepare(`UPDATE users SET vip_level = ? WHERE id = ?`)
        .run(newLevel, userId);

        updateBalance(userId, -item.price);

        return interaction.reply(`👑 Your VIP level has been upgraded to **${newLevel}**!`);
    }

    // 🟣 Boost effects
    if (item.id.startsWith("boost_")) {
        const expires = Math.floor(Date.now() / 1000) + 3600; // 1 hour

        db.prepare(`
        INSERT INTO active_effects (user_id, effect_id, expires_at)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id, effect_id)
        DO UPDATE SET expires_at = excluded.expires_at
        `).run(userId, item.id, expires);

        updateBalance(userId, -item.price);

        return interaction.reply(`⚡ Activated **${item.name}** for 1 hour!`);
    }

    // 🧪 Consumables (heal, energy)
    if (["heal", "energy"].includes(item.id)) {
        db.prepare(`
        INSERT INTO inventory (user_id, item_id, amount)
        VALUES (?, ?, 1)
        ON CONFLICT(user_id, item_id)
        DO UPDATE SET amount = amount + 1
        `).run(userId, item.id);

        updateBalance(userId, -item.price);

        return interaction.reply(`🧪 Added **${item.name}** to your inventory!`);
    }

    // 🛡️ PvP items, Crime items, Rare items → inventory
    db.prepare(`
    INSERT INTO inventory (user_id, item_id, amount)
    VALUES (?, ?, 1)
    ON CONFLICT(user_id, item_id)
    DO UPDATE SET amount = amount + 1
    `).run(userId, item.id);

    updateBalance(userId, -item.price);

    return interaction.reply(`🛒 You bought **${item.name}** for **€${item.price}**!`);
}
