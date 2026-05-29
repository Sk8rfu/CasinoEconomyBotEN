import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance, hasEffect, removeEffect } from '../db.js';

const symbols = ["🍒", "🍋", "🍇", "⭐", "💎"];

export const data = new SlashCommandBuilder()
.setName('slots')
.setDescription('Play the slot machine')
.addIntegerOption(opt =>
opt.setName('bet')
.setDescription('How much you want to bet')
.setRequired(true)
);

export async function execute(interaction) {
    const id = interaction.user.id;
    const bet = interaction.options.getInteger('bet');
    const user = getUser(id);

    if (bet <= 0) return interaction.reply('❌ The bet must be a positive number.');
    if (user.balance < bet) return interaction.reply('❌ You don’t have enough money.');

    const r1 = symbols[Math.floor(Math.random() * symbols.length)];
    const r2 = symbols[Math.floor(Math.random() * symbols.length)];
    const r3 = symbols[Math.floor(Math.random() * symbols.length)];

    let multiplier = 0;

    // 🎰 Base winnings
    if (r1 === r2 && r2 === r3) multiplier = 10;
    else if (r1 === r2 || r2 === r3 || r1 === r3) multiplier = 5;

    // 🍀 Luck effects
    let luckBonus = 0;

    if (hasEffect(id, "luck_small")) luckBonus += 0.05;
    if (hasEffect(id, "luck_big")) luckBonus += 0.15;

    // Chance to improve the result
    if (Math.random() < luckBonus) {
        multiplier = Math.max(multiplier, 5); // at least a pair
    }

    // 👑 VIP bonus
    const vipBonus = 1 + user.vip_level * 0.1;

    // 💰 Calculate winnings
    let win = Math.floor(bet * multiplier * vipBonus);

    // 🎯 Slots Boost
    if (hasEffect(id, "boost_slots")) {
        win = Math.floor(win * 1.5);
    }

    // 🔥 Phoenix Feather → saves from losing
    if (win === 0 && hasEffect(id, "phoenix")) {
        removeEffect(id, "phoenix");
        win = bet; // refund the bet
    }

    updateBalance(id, -bet + win);

    const embed = new EmbedBuilder()
    .setColor('#FF4500')
    .setTitle('🎰 Slot Machine')
    .setDescription(`| ${r1} | ${r2} | ${r3} |`)
    .addFields(
        { name: 'Bet', value: `€${bet}`, inline: true },
        {
            name: 'Result',
            value: win > 0
            ? `🎉 You won **€${win}**!`
            : `💀 You lost your bet.`,
            inline: true
        }
    )
    .setTimestamp()
    .setFooter({ text: 'CasinoEconomyBot — Slots' });

    return interaction.reply({ embeds: [embed] });
}
