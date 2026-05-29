import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('dicebot')
.setDescription('Play Dice Duel against the bot')
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

    const playerRoll = Math.floor(Math.random() * 6) + 1;
    const botRoll = Math.floor(Math.random() * 6) + 1;

    let result = "";
    let win = 0;

    if (playerRoll > botRoll) {
        const vipBonus = 1 + user.vip_level * 0.05;
        win = Math.floor(bet * vipBonus);
        updateBalance(id, win);
        result = `🎉 You beat the bot and won **€${win}**!`;
    } else if (playerRoll < botRoll) {
        updateBalance(id, -bet);
        result = `💀 The bot won. You lost **€${bet}**.`;
    } else {
        result = "🤝 It's a tie! No win or loss.";
    }

    const embed = new EmbedBuilder()
    .setColor('#00A6FF')
    .setTitle('🎲 Dice Duel — VS Bot')
    .addFields(
        { name: "Your Roll", value: `${playerRoll}`, inline: true },
        { name: "Bot's Roll", value: `${botRoll}`, inline: true }
    )
    .setDescription(result)
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
