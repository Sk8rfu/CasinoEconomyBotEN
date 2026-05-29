import { SlashCommandBuilder } from 'discord.js';
import { getUser, updateBalance, updateUser } from '../db.js';
import db from '../db.js';
import { items } from './shop.js';
import { mysteryRewards } from './mysteryRewards.js';

export const data = new SlashCommandBuilder()
.setName('mysterybox')
.setDescription('Open a Mystery Box (€25,000)');

export async function execute(interaction) {
    const userId = interaction.user.id;
    const user = getUser(userId);

    const cost = 25000;

    if (user.balance < cost)
        return interaction.reply("❌ You don’t have enough money.");

    updateBalance(userId, -cost);

    const roll = Math.random() * 100;
    let sum = 0;
    let reward = null;

    for (const r of mysteryRewards) {
        sum += r.chance;
        if (roll <= sum) {
            reward = r;
            break;
        }
    }

    if (!reward || reward.type === "nothing")
        return interaction.reply("📦 The Mystery Box was empty...");

    // 💰 MONEY
    if (reward.type === "money") {
        updateBalance(userId, reward.amount);
        return interaction.reply(`📦 You received **€${reward.amount}**!`);
    }

    // 👑 VIP REWARD (DOES NOT STACK)
    if (reward.type === "vip") {
        const MAX_VIP = 5;
        const newVip = reward.level; // Mystery Box gives VIP 1 or VIP 2 directly

        // If already max VIP → give money instead
        if (user.vip_level >= MAX_VIP) {
            updateBalance(userId, 20000);
            return interaction.reply(
                "👑 You are already at the maximum VIP level! You receive **€20,000** instead."
            );
        }

        // If user already has higher VIP → do not downgrade
        if (user.vip_level >= newVip) {
            return interaction.reply(
                `👑 The Mystery Box granted VIP +${reward.level}, but you already have a higher VIP level!`
            );
        }

        // Apply new VIP level (directly, no stacking)
        const finalVip = Math.min(newVip, MAX_VIP);
        updateUser(userId, { vip_level: finalVip });

        return interaction.reply(`👑 The Mystery Box granted you **VIP ${finalVip}**!`);
    }

    // 🎁 ITEM REWARD
    if (reward.type === "item") {
        db.prepare(`
        INSERT INTO inventory (user_id, item_id, amount)
        VALUES (?, ?, 1)
        ON CONFLICT(user_id, item_id)
        DO UPDATE SET amount = amount + 1
        `).run(userId, reward.id);

        const item = items.find(i => i.id === reward.id);
        return interaction.reply(`🎁 The Mystery Box gave you: **${item.name}**!`);
    }
}
