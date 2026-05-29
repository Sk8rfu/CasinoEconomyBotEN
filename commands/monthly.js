import { SlashCommandBuilder } from 'discord.js';
import { getUser, updateBalance, getCooldown, setCooldown } from '../db.js';

const MONTHLY_COOLDOWN = 30 * 24 * 60 * 60 * 1000;

export const data = new SlashCommandBuilder()
.setName('monthly')
.setDescription('Claim your monthly reward');

export async function execute(interaction) {
    const id = interaction.user.id;
    const now = Date.now();
    const last = getCooldown(id, 'monthly');

    if (last && now - last < MONTHLY_COOLDOWN) {
        const remaining = MONTHLY_COOLDOWN - (now - last);
        const days = Math.ceil(remaining / (1000 * 60 * 60 * 24));

        return interaction.reply(`⏳ Your monthly reward will be available in ~${days} days.`);
    }

    const user = getUser(id);

    // Random reward €5000–€10000
    const base = Math.floor(Math.random() * 5001) + 5000;
    const reward = Math.floor(base * (1 + user.vip_level * 0.2));

    const newBalance = updateBalance(id, reward);
    setCooldown(id, 'monthly', now);

    return interaction.reply(
        `📆 You received **€${reward}** as your monthly reward!\n` +
        `💰 New balance: **€${newBalance}**`
    );
}
