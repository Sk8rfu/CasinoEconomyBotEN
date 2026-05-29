import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('rank')
.setDescription('Shows your rank based on your money');

export async function execute(interaction) {
    const user = getUser(interaction.user.id);

    let rank = "Rookie";

    if (user.balance >= 1000) rank = "Worker";
    if (user.balance >= 10000) rank = "Businessman";
    if (user.balance >= 50000) rank = "Millionaire in Progress";
    if (user.balance >= 100000) rank = "Wealthy";
    if (user.balance >= 500000) rank = "Multimillionaire";
    if (user.balance >= 1000000) rank = "Legend of Wealth";

    const embed = new EmbedBuilder()
    .setColor('#32CD32')
    .setTitle('📈 Your Rank')
    .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
    .addFields(
        { name: 'Rank', value: rank, inline: true },
        { name: 'Balance', value: `€${user.balance}`, inline: true }
    )
    .setFooter({ text: 'CasinoEconomyBot — Rank System' })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
