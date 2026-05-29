import { SlashCommandBuilder } from 'discord.js';
import { getUser, updateBalance, getCooldown, setCooldown } from '../db.js';

const WEEKLY_COOLDOWN = 7 * 24 * 60 * 60 * 1000;

export const data = new SlashCommandBuilder()
.setName('weekly')
.setDescription('Claim your weekly reward');

export async function execute(interaction) {
    const id = interaction.user.id;
    const now = Date.now();
    const last = getCooldown(id, 'weekly');

    if (last && now - last < WEEKLY_COOLDOWN) {
        const remaining = WEEKLY_COOLDOWN - (now - last);
        const days = Math.ceil(remaining / (1000 * 60 * 60 * 24));

        return interaction.reply(`⏳ Your weekly reward will be available in ~${days} days.`);
    }

    const user = getUser(id);

    // Random reward €1000–€3000
    const base = Math.floor(Math.random() * 2001) + 1000;
    const reward = Math.floor(base * (1 + user.vip_level * 0.2));

    const newBalance = updateBalance(id, reward);
    setCooldown(id, 'weekly', now);

    return interaction.reply(`📅 You received **€${reward}** as your weekly reward!\n💰 New balance: **€${newBalance}**`);
}
