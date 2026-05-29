import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../db.js';

function getRank(balance) {
    if (balance >= 1000000) return "Legend of Wealth";
    if (balance >= 500000) return "Multimillionaire";
    if (balance >= 100000) return "Wealthy";
    if (balance >= 50000) return "Millionaire in Progress";
    if (balance >= 10000) return "Businessman";
    if (balance >= 1000) return "Worker";
    return "Rookie";
}

export const data = new SlashCommandBuilder()
.setName('ranklist')
.setDescription('Shows the leaderboard sorted by rank');

export async function execute(interaction) {
    const rows = db.prepare(`SELECT id, balance FROM users`).all();

    if (rows.length === 0) {
        return interaction.reply("❌ No leaderboard data available.");
    }

    rows.sort((a, b) => b.balance - a.balance);

    let desc = "";

    for (let i = 0; i < Math.min(rows.length, 20); i++) {
        const user = await interaction.client.users.fetch(rows[i].id).catch(() => null);
        const name = user ? user.username : "Unknown User";
        const rank = getRank(rows[i].balance);

        desc += `**${i + 1}. ${name}** — ${rank} (€${rows[i].balance})\n`;
    }

    const embed = new EmbedBuilder()
    .setColor('#4B0082')
    .setTitle('📈 Rank Leaderboard')
    .setDescription(desc)
    .setFooter({ text: 'CasinoEconomyBot — Rank System' })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
