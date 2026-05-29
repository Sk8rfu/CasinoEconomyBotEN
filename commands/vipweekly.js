import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('vipweekly')
.setDescription('Claim your weekly VIP reward');

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
    const cooldown = 7 * 24 * 60 * 60 * 1000; // 7 days

    if (user.vipweekly_last && now - user.vipweekly_last < cooldown) {
        const remaining = cooldown - (now - user.vipweekly_last);
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        return interaction.reply({
            content: `⏳ You can claim your next weekly VIP reward in **${days} days and ${hours} hours**.`,
            flags: 64
        });
    }

    const rewards = {
        1: 5000,
        2: 10000,
        3: 15000,
        4: 20000,
        5: 25000
    };

    const reward = rewards[user.vip_level] || 5000;

    updateBalance(id, reward);
    user.vipweekly_last = now;

    const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('👑 VIP Weekly Reward')
    .setDescription(`You received **€${reward}** for your VIP level!`)
    .addFields(
        { name: 'VIP Level', value: `${user.vip_level}`, inline: true },
        { name: 'Reward', value: `€${reward}`, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: 'CasinoEconomyBot — VIP Weekly' });

    return interaction.reply({ embeds: [embed] });
}
