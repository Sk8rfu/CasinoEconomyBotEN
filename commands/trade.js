import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../db.js';
import { items } from './shop.js';

export const data = new SlashCommandBuilder()
.setName('trade')
.setDescription('Send an item to another player')
.addUserOption(opt =>
opt.setName('user')
.setDescription('Who you want to send the item to')
.setRequired(true)
)
.addStringOption(opt =>
opt.setName('item')
.setDescription('Item ID (see /inventory)')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('amount')
.setDescription('Quantity')
.setRequired(true)
);

export async function execute(interaction) {
    const senderId = interaction.user.id;
    const receiver = interaction.options.getUser('user');
    const itemId = interaction.options.getString('item');
    const amount = interaction.options.getInteger('amount');

    if (receiver.id === senderId) {
        return interaction.reply("❌ You cannot trade with yourself.");
    }

    if (amount <= 0) {
        return interaction.reply("❌ Quantity must be at least 1.");
    }

    // Validate item ID
    const item = items.find(i => i.id === itemId);
    if (!item) {
        return interaction.reply("❌ Invalid item ID. Check /inventory.");
    }

    // Check if sender owns enough of the item
    const row = db.prepare(`
    SELECT amount FROM inventory WHERE user_id = ? AND item_id = ?
    `).get(senderId, itemId);

    if (!row || row.amount < amount) {
        return interaction.reply(`❌ You don't have enough **${item.name}**.`);
    }

    // Remove from sender
    db.prepare(`
    UPDATE inventory SET amount = amount - ?
    WHERE user_id = ? AND item_id = ?
    `).run(amount, senderId, itemId);

    // Delete row if amount becomes 0
    db.prepare(`
    DELETE FROM inventory WHERE user_id = ? AND item_id = ? AND amount <= 0
    `).run(senderId, itemId);

    // Add to receiver
    db.prepare(`
    INSERT INTO inventory (user_id, item_id, amount)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, item_id)
    DO UPDATE SET amount = amount + excluded.amount
    `).run(receiver.id, itemId, amount);

    // Confirmation embed
    const embed = new EmbedBuilder()
    .setColor('#00FF7F')
    .setTitle('📦 Successful Trade')
    .setDescription(
        `**${interaction.user.username}** sent **${amount}× ${item.name}** to **${receiver.username}**`
    )
    .addFields(
        { name: "Item", value: `${item.name}`, inline: true },
        { name: "Quantity", value: `${amount}`, inline: true },
        { name: "ID", value: `\`${item.id}\``, inline: true }
    )
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
