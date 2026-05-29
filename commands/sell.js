import { SlashCommandBuilder } from 'discord.js';
import db from '../db.js';
import { items } from './shop.js';
import { updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('sell')
.setDescription('Sell an item from your inventory')
.addStringOption(opt =>
opt.setName('id')
.setDescription('ID of the item')
.setRequired(true)
);

export async function execute(interaction) {
    const userId = interaction.user.id;
    const itemId = interaction.options.getString('id');

    const inv = db.prepare(`
    SELECT amount FROM inventory WHERE user_id = ? AND item_id = ?
    `).get(userId, itemId);

    if (!inv || inv.amount <= 0)
        return interaction.reply("❌ You don’t have this item.");

    const item = items.find(i => i.id === itemId);
    if (!item) return interaction.reply("❌ Invalid item.");

    const sellPrice = Math.floor(item.price * 0.5);

    updateBalance(userId, sellPrice);

    db.prepare(`
    UPDATE inventory SET amount = amount - 1
    WHERE user_id = ? AND item_id = ?
    `).run(userId, itemId);

    return interaction.reply(`💸 You sold **${item.name}** for **€${sellPrice}**.`);
}
