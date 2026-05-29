import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../db.js';

export const data = new SlashCommandBuilder()
.setName('leaderboard')
.setDescription('Shows the top 10 richest players');

export async function execute(interaction) {
    const rows = db.prepare(`
    SELECT id, balance
    FROM users
    ORDER BY balance DESC
    LIMIT 10
    `).all();

    if (rows.length === 0) {
        return interaction.reply("❌ No leaderboard data available.");
    }

    let desc = "";

    for (let i = 0; i < rows.length; i++) {
        const user = await interaction.client.users.fetch(rows[i].id).catch(() => null);
        const name = user ? user.username : "Unknown User";
        desc += `**${i + 1}. ${name}** — 💰 €${rows[i].balance}\n`;
    }

    const embed = new EmbedBuilder()
    .setColor('#00BFFF')
    .setTitle('🏆 Top 10 Richest Players')
    .setDescription(desc)
    .setFooter({ text: 'CasinoEconomyBot — Leaderboards' })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
