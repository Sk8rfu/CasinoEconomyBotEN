import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../db.js';
import { items } from './shop.js';

export const data = new SlashCommandBuilder()
.setName('inventory')
.setDescription('Shows your inventory');

const categoryEmojis = {
    "VIP": "👑",
    "Boosts": "⚡",
    "Luck": "🍀",
    "Crime": "🦹",
    "PvP": "⚔️",
    "Consumables": "🧪",
    "Economy": "💳",
    "Rare Items": "💎",
    "Bulgarian Artifacts": "🇧🇬",
    "Vehicles": "🚗",
    "Other": "📦"
};

export async function execute(interaction) {
    const userId = interaction.user.id;

    const rows = db.prepare(`
    SELECT item_id, amount FROM inventory WHERE user_id = ?
    `).all(userId);

    if (rows.length === 0)
        return interaction.reply("🎒 Your inventory is empty.");

    // Group items by category
    const categories = {};

    for (const row of rows) {
        const item = items.find(i => i.id === row.item_id);
        if (!item) continue;

        const category = item.category || "Other";

        if (!categories[category]) categories[category] = [];
        categories[category].push({
            name: item.name,
            id: item.id,
            amount: row.amount
        });
    }

    const embed = new EmbedBuilder()
    .setColor('#FFA500')
    .setTitle('🎒 Your Inventory')
    .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
    .setFooter({ text: 'CasinoEconomyBot — Inventory' })
    .setTimestamp();

    // Add categories to the embed
    for (const category of Object.keys(categories)) {
        const emoji = categoryEmojis[category] || "📦";

        let text = "";
        for (const item of categories[category]) {
            text += `• **${item.name}** × ${item.amount}\n`;
            text += `🆔 \`${item.id}\`\n\n`; // ID displayed under the item
        }

        embed.addFields({
            name: `${emoji} ${category}`,
            value: text
        });
    }

    return interaction.reply({ embeds: [embed] });
}
