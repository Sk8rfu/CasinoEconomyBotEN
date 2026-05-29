import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('cashout')
.setDescription('Collect your winnings from Mines Multi');

export async function execute(interaction) {
    const id = interaction.user.id;
    const game = global.minesGames[id];

    if (!game) {
        return interaction.reply({
            content: "❌ You do not have an active Mines Multi game.",
            flags: 64
        });
    }

    const user = getUser(id);
    const vipBonus = 1 + user.vip_level * 0.05;

    const win = Math.floor(game.bet * game.multiplier * vipBonus);

    updateBalance(id, win);
    delete global.minesGames[id];

    const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('💰 Cashout Successful!')
    .setDescription(
        `Multiplier: **${game.multiplier.toFixed(2)}x**\n` +
        `VIP Bonus: **${(vipBonus * 100 - 100).toFixed(0)}%**\n\n` +
        `You win: **€${win}**`
    )
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
