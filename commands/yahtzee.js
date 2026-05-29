import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('yahtzee')
.setDescription('Play Yahtzee (5 dice)')
.addIntegerOption(opt =>
opt.setName('bet')
.setDescription('How much you want to bet')
.setRequired(true)
);

function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}

export async function execute(interaction) {
    const id = interaction.user.id;
    const bet = interaction.options.getInteger('bet');
    const user = getUser(id);

    if (bet <= 0) return interaction.reply('❌ The bet must be a positive number.');
    if (user.balance < bet) return interaction.reply('❌ You don’t have enough money.');

    const dice = [rollDice(), rollDice(), rollDice(), rollDice(), rollDice()];
    const counts = {};

    for (const d of dice) counts[d] = (counts[d] || 0) + 1;

    let multiplier = 0;

    if (Object.values(counts).includes(5)) multiplier = 20;
    else if (Object.values(counts).includes(4)) multiplier = 10;
    else if (Object.values(counts).includes(3) && Object.values(counts).includes(2)) multiplier = 7;
    else if (Object.values(counts).includes(3)) multiplier = 5;
    else if (Object.values(counts).includes(2)) multiplier = 2;

    const vipBonus = 1 + user.vip_level * 0.1;
    const win = Math.floor(bet * multiplier * vipBonus);

    updateBalance(id, -bet + win);

    const embed = new EmbedBuilder()
    .setColor('#8B0000')
    .setTitle('🎲 Yahtzee')
    .setDescription(`Dice: **${dice.join(' | ')}**`)
    .addFields(
        {
            name: 'Combination',
            value: multiplier > 0 ? `Multiplier ×${multiplier}` : 'No combination',
            inline: true
        },
        {
            name: 'Result',
            value: win > 0
            ? `🎉 You won **€${win}**!`
            : `💀 You lost **€${bet}**.`,
            inline: true
        }
    )
    .setTimestamp()
    .setFooter({ text: 'CasinoEconomyBot — Yahtzee' });

    return interaction.reply({ embeds: [embed] });
}
