import { SlashCommandBuilder } from 'discord.js';
import { getUser, updateBalance, getCooldown, setCooldown } from '../db.js';

const DAILY_COOLDOWN = 24 * 60 * 60 * 1000;

export const data = new SlashCommandBuilder()
.setName('daily')
.setDescription('Claim your daily reward');

export async function execute(interaction) {
    const id = interaction.user.id;
    const now = Date.now();
    const last = getCooldown(id, 'daily');

    if (last && now - last < DAILY_COOLDOWN) {
        const remaining = DAILY_COOLDOWN - (now - last);
        const hours = Math.ceil(remaining / (1000 * 60 * 60));

        return interaction.reply(`⏳ You already claimed your daily reward. Try again in ~${hours} hours.`);
    }

    const user = getUser(id);

    // Random reward 100–500 € + VIP bonus
    const base = Math.floor(Math.random() * 401) + 100;
    const reward = Math.floor(base * (1 + user.vip_level * 0.2));

    const newBalance = updateBalance(id, reward);
    setCooldown(id, 'daily', now);

    return interaction.reply(`🎁 You received **€${reward}**!\n💰 New balance: **€${newBalance}**`);
}
