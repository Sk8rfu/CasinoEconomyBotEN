import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('vip')
.setDescription('Shows your VIP level and bonuses');

export async function execute(interaction) {
    const user = getUser(interaction.user.id);

    // Ensure level does not exceed 5
    const level = Math.min(user.vip_level, 5);

    const bonuses = {
        0: "No bonuses",
        1: "+20% rewards, +10% work income",
        2: "+40% rewards, +20% work income",
        3: "+60% rewards, +30% work income",
        4: "+80% rewards, +40% work income",
        5: "+100% rewards, +50% work income"
    };

    const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('👑 Your VIP Level')
    .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
    .addFields(
        { name: 'Level', value: `${level}`, inline: true },
        { name: 'Bonuses', value: bonuses[level], inline: true }
    )
    .setFooter({ text: 'CasinoEconomyBot — VIP System' })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
