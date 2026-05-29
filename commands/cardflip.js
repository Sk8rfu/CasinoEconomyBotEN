import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance, hasEffect } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('cardflip')
.setDescription('Choose one of three cards and test your luck!')
.addIntegerOption(opt =>
opt.setName('bet')
.setDescription('How much you want to bet')
.setRequired(true)
);

export async function execute(interaction) {
    const id = interaction.user.id;
    const bet = interaction.options.getInteger('bet');
    const user = getUser(id);

    if (bet <= 0) {
        return interaction.reply({ content: "❌ The bet must be a positive number.", flags: 64 });
    }

    if (user.balance < bet) {
        return interaction.reply({ content: "❌ You don’t have enough money.", flags: 64 });
    }

    // Chances
    let winChance = 0.33;

    if (hasEffect(id, "luck_small")) winChance += 0.05;
    if (hasEffect(id, "luck_big")) winChance += 0.15;

    const roll = Math.random();
    let result = "";
    let multiplier = 0;

    if (roll < winChance * 0.2) {
        result = "💎 Golden Card (x3)";
        multiplier = 3;
    } else if (roll < winChance) {
        result = "🔷 Blue Card (x2)";
        multiplier = 2;
    } else {
        result = "❌ Red Card (lose)";
        multiplier = 0;
    }

    const vipBonus = 1 + user.vip_level * 0.05;
    const win = Math.floor(bet * multiplier * vipBonus);

    updateBalance(id, win - bet);

    const embed = new EmbedBuilder()
    .setColor(multiplier > 0 ? '#00FF00' : '#FF0000')
    .setTitle('🃏 Card Flip')
    .setDescription(`You drew: **${result}**`)
    .addFields(
        { name: "Bet", value: `€${bet}`, inline: true },
        { name: "Multiplier", value: `${multiplier}x`, inline: true },
        { name: "Winnings", value: `€${win}`, inline: true }
    )
    .setFooter({ text: "CasinoEconomyBot — Card Flip" })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
