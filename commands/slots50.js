import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance, hasEffect, removeEffect } from '../db.js';

const symbols = ["🍒", "🍋", "🍇", "⭐", "💎"];

export const data = new SlashCommandBuilder()
.setName('slots50')
.setDescription('Spin the slot machine 50 times at once')
.addIntegerOption(opt =>
opt.setName('bet')
.setDescription('Bet amount for each spin')
.setRequired(true)
);

export async function execute(interaction) {
    const id = interaction.user.id;
    const bet = interaction.options.getInteger('bet');
    const user = getUser(id);

    if (bet <= 0) {
        return interaction.reply({
            content: '❌ The bet must be a positive number.',
            flags: 64
        });
    }

    if (user.balance < bet * 50) {
        return interaction.reply({
            content: '❌ You don’t have enough money for 50 spins.',
            flags: 64
        });
    }

    let totalWin = 0;
    let results = [];

    for (let i = 0; i < 50; i++) {
        const r1 = symbols[Math.floor(Math.random() * symbols.length)];
        const r2 = symbols[Math.floor(Math.random() * symbols.length)];
        const r3 = symbols[Math.floor(Math.random() * symbols.length)];

        let multiplier = 0;

        if (r1 === r2 && r2 === r3) multiplier = 10;
        else if (r1 === r2 || r2 === r3 || r1 === r3) multiplier = 5;

        // Luck effects
        let luckBonus = 0;
        if (hasEffect(id, "luck_small")) luckBonus += 0.05;
        if (hasEffect(id, "luck_big")) luckBonus += 0.15;

        if (Math.random() < luckBonus) {
            multiplier = Math.max(multiplier, 5);
        }

        // VIP bonus
        const vipBonus = 1 + user.vip_level * 0.1;

        let win = Math.floor(bet * multiplier * vipBonus);

        // Slots Boost
        if (hasEffect(id, "boost_slots")) {
            win = Math.floor(win * 1.5);
        }

        totalWin += win;
        results.push(`| ${r1} | ${r2} | ${r3} | → €${win}`);
    }

    // Phoenix Feather → saves from total loss
    if (totalWin === 0 && hasEffect(id, "phoenix")) {
        removeEffect(id, "phoenix");
        totalWin = bet * 50;
    }

    updateBalance(id, -bet * 50 + totalWin);

    const embed = new EmbedBuilder()
    .setColor('#FF4500')
    .setTitle('🎰 Slots x50')
    .setDescription(results.join("\n"))
    .addFields(
        { name: 'Total Bet', value: `€${bet * 50}`, inline: true },
        { name: 'Total Won', value: `€${totalWin}`, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: 'CasinoEconomyBot — Slots x50' });

    return interaction.reply({ embeds: [embed] });
}
