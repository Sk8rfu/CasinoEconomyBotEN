import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('balance')
.setDescription('Shows your balance');

export async function execute(interaction) {
    const user = getUser(interaction.user.id);

    const embed = new EmbedBuilder()
    .setColor('#00FF7F')
    .setTitle('💰 Your Balance')
    .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
    .addFields(
        { name: '🪙 Wallet', value: `€${user.balance}`, inline: true },
        { name: '🏦 Bank', value: `€${user.bank}`, inline: true },
        { name: '📏 Limit', value: `€${user.bank_limit}`, inline: true },
        { name: '💳 Loan', value: `€${user.loan}`, inline: true },
        { name: '👑 VIP Level', value: `${user.vip_level}`, inline: true }
    )
    .setFooter({ text: 'CasinoEconomyBot' })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
