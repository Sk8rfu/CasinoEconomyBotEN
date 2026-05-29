import { SlashCommandBuilder } from 'discord.js';
import {
    getUser,
    updateBalance,
    getCooldown,
    setCooldown,
    hasEffect,
    removeEffect
} from '../db.js';

const CRIME_COOLDOWN = 15 * 60 * 1000;

export const data = new SlashCommandBuilder()
.setName('crime')
.setDescription('Attempt to commit a crime for money');

export async function execute(interaction) {
    const id = interaction.user.id;
    const now = Date.now();

    const last = getCooldown(id, 'crime');
    if (last && now - last < CRIME_COOLDOWN) {
        const remaining = CRIME_COOLDOWN - (now - last);
        const minutes = Math.ceil(remaining / 60000);
        return interaction.reply(`⏳ Wait **${minutes} more minutes**.`);
    }

    const user = getUser(id);

    let successChance = 0.3 + user.vip_level * 0.03;

    if (hasEffect(id, "crime_mask")) successChance += 0.20;
    if (hasEffect(id, "luck_small")) successChance += 0.05;
    if (hasEffect(id, "luck_big")) successChance += 0.15;

    const success = Math.random() < successChance;

    if (success) {
        const reward = Math.floor(Math.random() * 5501 + 2500); // 2500–8000
        updateBalance(id, reward);
        setCooldown(id, 'crime', now);

        return interaction.reply(`🦹 Success! You earned **€${reward}**.`);
    } else {
        let fine = Math.floor(Math.random() * 4001 + 1000); // 1000–5000

        if (hasEffect(id, "phoenix")) {
            removeEffect(id, "phoenix");
            fine = 0;
            setCooldown(id, 'crime', now);
            return interaction.reply(`🔥 Phoenix Feather saved you from the fine!`);
        }

        updateBalance(id, -fine);
        setCooldown(id, 'crime', now);

        return interaction.reply(`🚨 Failed! The police caught you and you paid a **€${fine}** fine.`);
    }
}
