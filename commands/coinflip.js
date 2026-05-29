import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('coinflip')
.setDescription('Heads or tails')
.addStringOption(opt =>
opt.setName('choice')
.setDescription('heads or tails')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('bet')
.setDescription('How much you want to bet')
.setRequired(true)
);

export async function execute(interaction) {
    const id = interaction.user.id;
    const choice = interaction.options.getString('choice').toLowerCase();
    const bet = interaction.options.getInteger('bet');
    const user = getUser(id);

    if (!["heads", "tails"].includes(choice)) {
        return interaction.reply("❌ Choose **heads** or **tails**.");
    }

    if (bet <= 0) return interaction.reply("❌ The bet must be a positive number.");
    if (user.balance < bet) return interaction.reply("❌ You don’t have enough money.");

    const result = Math.random() < 0.5 ? "heads" : "tails";

    let win = 0;
    if (choice === result) {
        win = Math.floor(bet * 2 * (1 + user.vip_level * 0.1));
    }

    updateBalance(id, -bet + win);

    const embed = new EmbedBuilder()
    .setColor('#DAA520')
    .setTitle('🪙 Coinflip')
    .addFields(
        { name: 'Result', value: `The coin landed on **${result}**`, inline: true },
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
    .setFooter({ text: 'CasinoEconomyBot — Coinflip' });

    return interaction.reply({ embeds: [embed] });
}
