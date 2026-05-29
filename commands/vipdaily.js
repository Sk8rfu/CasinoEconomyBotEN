import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('vipdaily')
.setDescription('Claim your daily VIP reward');

export async function execute(interaction) {
    const id = interaction.user.id;
    const user = getUser(id);

    if (user.vip_level <= 0) {
        return interaction.reply({
            content: "❌ You don't have a VIP level. Use /vip for more information.",
            flags: 64
        });
    }

    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000; // 24 hours

    if (user.vipdaily_last && now - user.vipdaily_last < cooldown) {
        const remaining = cooldown - (now - user.vipdaily_last);
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

        return interaction.reply({
            content: `⏳ You can claim your next VIP reward in **${hours}h ${minutes}m**.`,
            flags: 64
        });
    }

    // Rewards based on VIP level
    const rewards = {
        1: 500,
        2: 1000,
        3: 2000,
        4: 3500,
        5: 5000
    };

    const reward = rewards[user.vip_level] || 500;

    updateBalance(id, reward);
    user.vipdaily_last = now;

    const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('👑 VIP Daily Reward')
    .setDescription(`You received **€${reward}** for your VIP level!`)
    .addFields(
        { name: 'VIP Level', value: `${user.vip_level}`, inline: true },
        { name: 'Reward', value: `€${reward}`, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: 'CasinoEconomyBot — VIP Daily' });

    return interaction.reply({ embeds: [embed] });
}
