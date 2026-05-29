import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('vipmonthly')
.setDescription('Claim your monthly VIP reward');

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
    const cooldown = 30 * 24 * 60 * 60 * 1000; // 30 days

    if (user.vipmonthly_last && now - user.vipmonthly_last < cooldown) {
        const remaining = cooldown - (now - user.vipmonthly_last);
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        return interaction.reply({
            content: `⏳ You can claim your next monthly VIP reward in **${days} days and ${hours} hours**.`,
            flags: 64
        });
    }

    const rewards = {
        1: 20000,
        2: 40000,
        3: 60000,
        4: 80000,
        5: 100000
    };

    const reward = rewards[user.vip_level] || 20000;

    updateBalance(id, reward);
    user.vipmonthly_last = now;

    const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('👑 VIP Monthly Reward')
    .setDescription(`You received **€${reward}** for your VIP level!`)
    .addFields(
        { name: 'VIP Level', value: `${user.vip_level}`, inline: true },
        { name: 'Reward', value: `€${reward}`, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: 'CasinoEconomyBot — VIP Monthly' });

    return interaction.reply({ embeds: [embed] });
}
