import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../db.js';

export const data = new SlashCommandBuilder()
.setName('jackpot')
.setDescription('Shows the current Jackpot and participants');

export async function execute(interaction) {

    // Get all users with tickets > 0
    const participants = db.prepare(`
    SELECT id, jackpotTickets
    FROM users
    WHERE jackpotTickets > 0
    `).all();

    if (participants.length === 0) {
        return interaction.reply({
            content: "🎟️ There are no participants in the Jackpot.",
            flags: 64
        });
    }

    let totalTickets = participants.reduce((sum, u) => sum + u.jackpotTickets, 0);

    let desc = "";
    for (const p of participants) {
        const chance = ((p.jackpotTickets / totalTickets) * 100).toFixed(2);
        desc += `👤 <@${p.id}> — ${p.jackpotTickets} tickets (**${chance}% chance**)\n`;
    }

    const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('🏆 Jackpot — Participants')
    .setDescription(desc)
    .addFields(
        { name: "🎟 Total Tickets", value: `${totalTickets}`, inline: true },
        {
            name: "🎁 Prizes",
            value:
            "€50,000\n" +
            "€100,000\n" +
            "€250,000\n" +
            "€500,000\n" +
            "Diamond Token\n" +
            "Ancient Artifact\n" +
            "SIN R1\n" +
            "Blackjack Boost\n" +
            "Duel Boost"
        }
    )
    .setFooter({ text: "CasinoEconomyBot — Jackpot" })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
