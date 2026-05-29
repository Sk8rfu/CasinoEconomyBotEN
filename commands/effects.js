import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../db.js';
import { hasEffect } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('effects')
.setDescription('Shows your active effects');

export async function execute(interaction) {
    const userId = interaction.user.id;

    const rows = db.prepare(`
    SELECT effect_id, expires_at
    FROM active_effects
    WHERE user_id = ?
    `).all(userId);

    if (rows.length === 0)
        return interaction.reply("✨ You have no active effects.");

    const now = Math.floor(Date.now() / 1000);
    let effectsList = "";

    for (const row of rows) {
        const { effect_id, expires_at } = row;

        if (!hasEffect(userId, effect_id)) continue;

        const remaining = expires_at - now;

        const hours = Math.floor(remaining / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);
        const seconds = remaining % 60;

        let timeStr = "";
        if (hours > 0) timeStr = `${hours}h ${minutes}m`;
        else if (minutes > 0) timeStr = `${minutes}m ${seconds}s`;
        else timeStr = `${seconds}s`;

        effectsList += `• **${effect_id}** — remaining **${timeStr}**\n`;
    }

    const embed = new EmbedBuilder()
    .setColor('#8A2BE2')
    .setTitle('🧪 Active Effects')
    .setDescription(effectsList)
    .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
    .setFooter({ text: 'CasinoEconomyBot' })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
