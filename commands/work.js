import { SlashCommandBuilder } from 'discord.js';
import { getUser, updateBalance, getCooldown, setCooldown, hasEffect } from '../db.js';

const MIN_COOLDOWN = 5 * 60 * 1000;   // 5 minutes
const MAX_COOLDOWN = 10 * 60 * 1000;  // 10 minutes

export const data = new SlashCommandBuilder()
.setName('work')
.setDescription('Work and earn some money (5–10 min cooldown)');

export async function execute(interaction) {
    const id = interaction.user.id;
    const now = Date.now();

    // Check for Energy Drink
    const energyActive = hasEffect(id, "energy");

    // If Energy Drink is active → cooldown is 50% shorter
    const minCD = energyActive ? MIN_COOLDOWN / 2 : MIN_COOLDOWN;
    const maxCD = energyActive ? MAX_COOLDOWN / 2 : MAX_COOLDOWN;

    const last = getCooldown(id, 'work');
    if (last && now - last < minCD) {
        const remaining = minCD - (now - last);
        const minutes = Math.ceil(remaining / 60000);
        return interaction.reply(`⏳ You must wait **${minutes} more minutes** before working again.`);
    }

    // Get user data
    const userData = getUser(id);

    // Random salary €150–€450
    const base = Math.floor(Math.random() * 301) + 150;

    // VIP bonus: +10% per level
    const salary = Math.floor(base * (1 + userData.vip_level * 0.1));

    const newBalance = updateBalance(id, salary);

    // Apply cooldown between minCD and maxCD
    const randomCooldown = Math.floor(Math.random() * (maxCD - minCD)) + minCD;
    setCooldown(id, 'work', now);

    return interaction.reply(
        `🛠️ You worked hard and earned **€${salary}**!\n💰 New balance: **€${newBalance}**`
    );
}
