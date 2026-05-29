import { SlashCommandBuilder } from 'discord.js';
import {
    getUser,
    updateBalance,
    getCooldown,
    setCooldown,
    hasEffect,
    removeEffect
} from '../db.js';

const ROB_COOLDOWN = 10 * 60 * 1000; // 10 minutes
const MIN_TARGET_BALANCE = 2500;     // Minimum balance to be robbed

export const data = new SlashCommandBuilder()
.setName('rob')
.setDescription('Attempt to rob another user')
.addUserOption(opt =>
opt.setName('user')
.setDescription('Who you want to rob')
.setRequired(true)
);

export async function execute(interaction) {
    const thief = interaction.user;
    const target = interaction.options.getUser('user');

    if (thief.id === target.id) {
        return interaction.reply('❌ You cannot rob yourself.');
    }

    const now = Date.now();
    const last = getCooldown(thief.id, 'rob');

    if (last && now - last < ROB_COOLDOWN) {
        const remaining = ROB_COOLDOWN - (now - last);
        const minutes = Math.ceil(remaining / 60000);
        return interaction.reply(`⏳ You must wait **${minutes} more minutes**.`);
    }

    const thiefData = getUser(thief.id);
    const targetData = getUser(target.id);

    // ❌ Cannot rob someone with less than €2500
    if (targetData.balance < MIN_TARGET_BALANCE) {
        return interaction.reply('❌ This user does not have enough money to be robbed.');
    }

    // Base success chance
    let successChance = 0.4 + thiefData.vip_level * 0.05;

    if (hasEffect(thief.id, "rob_gloves")) successChance += 0.20;
    if (hasEffect(thief.id, "luck_small")) successChance += 0.05;
    if (hasEffect(thief.id, "luck_big")) successChance += 0.15;

    const success = Math.random() < successChance;

    if (success) {
        // 💰 Steal 10% – 35% of target's balance
        const percent = Math.random() * 0.25 + 0.10;
        const stolen = Math.floor(targetData.balance * percent);

        updateBalance(target.id, -stolen);
        const newBalance = updateBalance(thief.id, stolen);

        setCooldown(thief.id, 'rob', now);

        return interaction.reply(
            `🦹‍♂️ You successfully robbed **${target.username}** and stole **€${stolen}**!\n` +
            `💰 New balance: **€${newBalance}**`
        );
    } else {
        // 🚨 Fine: 5% – 15% of thief's balance
        const percent = Math.random() * 0.10 + 0.05;
        let fine = Math.floor(thiefData.balance * percent);

        // Minimum and maximum fine
        if (fine < 250) fine = 250;
        if (fine > 20000) fine = 20000;

        // 🔥 Phoenix Feather → avoids fine
        if (hasEffect(thief.id, "phoenix")) {
            removeEffect(thief.id, "phoenix");
            fine = 0;
            setCooldown(thief.id, 'rob', now);
            return interaction.reply(`🔥 Phoenix Feather saved you from the fine!`);
        }

        updateBalance(thief.id, -fine);
        setCooldown(thief.id, 'rob', now);

        return interaction.reply(
            `🚨 Failed! The police caught you and you paid a fine of **€${fine}**.`
        );
    }
}
