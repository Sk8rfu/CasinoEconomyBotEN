import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('plinko')
.setDescription('Play Plinko — choose your risk and drop the ball!')
.addIntegerOption(opt =>
opt.setName('bet')
.setDescription('How much you want to bet')
.setRequired(true)
)
.addStringOption(opt =>
opt.setName('risk')
.setDescription('Risk level')
.addChoices(
    { name: 'Low', value: 'low' },
    { name: 'Medium', value: 'medium' },
    { name: 'High', value: 'high' }
)
.setRequired(true)
);

export async function execute(interaction) {
    const id = interaction.user.id;
    const bet = interaction.options.getInteger('bet');
    const risk = interaction.options.getString('risk');
    const user = getUser(id);

    if (bet <= 0) {
        return interaction.reply({ content: "❌ The bet must be a positive number.", flags: 64 });
    }

    if (user.balance < bet) {
        return interaction.reply({ content: "❌ You don’t have enough money.", flags: 64 });
    }

    // Multipliers based on risk
    const multipliers = {
        low:    [0.5, 0.7, 1, 1.2, 1.5, 2],
        medium: [0.3, 0.6, 1, 1.5, 2.5, 4],
        high:   [0.1, 0.3, 1, 2, 5, 10]
    };

    const list = multipliers[risk];
    const index = Math.floor(Math.random() * list.length);
    const multiplier = list[index];

    const vipBonus = 1 + user.vip_level * 0.05;
    const win = Math.floor(bet * multiplier * vipBonus);

    updateBalance(id, win - bet);

    const embed = new EmbedBuilder()
    .setColor(multiplier >= 1 ? '#00FF00' : '#FF0000')
    .setTitle('🎯 Plinko')
    .setDescription(
        `The ball landed in column **${index + 1}**!\n` +
        `Multiplier: **${multiplier}x**`
    )
    .addFields(
        { name: "Bet", value: `€${bet}`, inline: true },
        { name: "Winnings", value: `€${win}`, inline: true },
        { name: "Risk", value: risk, inline: true }
    )
    .setFooter({ text: "CasinoEconomyBot — Plinko" })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
