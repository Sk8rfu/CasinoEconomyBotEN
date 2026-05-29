import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getUser, updateBalance, addItem } from '../db.js';
import db from '../db.js';

export const data = new SlashCommandBuilder()
.setName('jackpotdraw')
.setDescription('Draws a winner from the Jackpot (admin only)')
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {

    // Fetch all participants with tickets > 0
    const participants = db.prepare(`
    SELECT id, jackpotTickets
    FROM users
    WHERE jackpotTickets > 0
    `).all();

    if (participants.length === 0) {
        return interaction.reply({ content: "❌ There are no tickets in the Jackpot.", flags: 64 });
    }

    // Build the ticket pool
    let ticketPool = [];
    for (const p of participants) {
        for (let i = 0; i < p.jackpotTickets; i++) {
            ticketPool.push(p.id);
        }
    }

    const winnerId = ticketPool[Math.floor(Math.random() * ticketPool.length)];
    const winner = getUser(winnerId);

    // Rewards
    const rewards = [
        { type: "money", amount: 50000 },
        { type: "money", amount: 100000 },
        { type: "money", amount: 250000 },
        { type: "money", amount: 500000 },

        { type: "item", id: "diamond", name: "Diamond Token" },
        { type: "item", id: "artifact", name: "Ancient Artifact" },
        { type: "item", id: "sin_r1", name: "SIN R1" },

        { type: "item", id: "boost_blackjack", name: "Blackjack Boost" },
        { type: "item", id: "boost_duel", name: "Duel Boost" }
    ];

    const reward = rewards[Math.floor(Math.random() * rewards.length)];

    let rewardText = "";

    if (reward.type === "money") {
        updateBalance(winnerId, reward.amount);
        rewardText = `💰 **€${reward.amount}**`;
    } else {
        addItem(winnerId, reward.id, 1);
        rewardText = `🎁 **${reward.name}**`;
    }

    // Reset tickets for the winner
    db.prepare(`UPDATE users SET jackpotTickets = 0 WHERE id = ?`).run(winnerId);

    const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('🏆 Jackpot — Winner!')
    .setDescription(
        `🎉 The winner is: <@${winnerId}>\n` +
        `Reward: ${rewardText}`
    )
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
