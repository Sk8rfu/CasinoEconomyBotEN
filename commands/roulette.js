import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('roulette')
.setDescription('Play roulette')
.addStringOption(opt =>
opt.setName('bet_on')
.setDescription('red, black, green or a number 0–36')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('bet')
.setDescription('How much you want to bet')
.setRequired(true)
);

export async function execute(interaction) {
    const id = interaction.user.id;
    const choice = interaction.options.getString('bet_on').toLowerCase();
    const bet = interaction.options.getInteger('bet');
    const user = getUser(id);

    if (bet <= 0) return interaction.reply("❌ The bet must be a positive number.");
    if (user.balance < bet) return interaction.reply("❌ You don’t have enough money.");

    const validColors = ["red", "black", "green"];
    const isNumber = !isNaN(choice) && Number(choice) >= 0 && Number(choice) <= 36;

    if (!validColors.includes(choice) && !isNumber) {
        return interaction.reply("❌ Invalid choice. Use red, black, green or a number 0–36.");
    }

    const result = Math.floor(Math.random() * 37);
    const color = result === 0 ? "green" : (result % 2 === 0 ? "black" : "red");

    let multiplier = 0;

    if (isNumber && Number(choice) === result) multiplier = 35;
    else if (!isNumber && choice === color) multiplier = choice === "green" ? 15 : 2;

    const win = Math.floor(bet * multiplier * (1 + user.vip_level * 0.1));
    updateBalance(id, -bet + win);

    const embed = new EmbedBuilder()
    .setColor(color === "red" ? '#FF0000' : color === "black" ? '#000000' : '#00FF00')
    .setTitle('🎰 Roulette')
    .addFields(
        { name: 'Result', value: `**${result} (${color})**`, inline: true },
               { name: 'Your Choice', value: choice, inline: true },
               {
                   name: 'Winnings',
                   value: win > 0
                   ? `🎉 **€${win}**`
                   : `💀 You lost **€${bet}**`,
                   inline: false
               }
    )
    .setTimestamp()
    .setFooter({ text: 'CasinoEconomyBot — Roulette' });

    return interaction.reply({ embeds: [embed] });
}
