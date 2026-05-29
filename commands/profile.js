import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, getEffects } from '../db.js';
import db from '../db.js';

export const data = new SlashCommandBuilder()
.setName('profile')
.setDescription('Shows your profile or another user’s profile')
.addUserOption(option =>
option
.setName('user')
.setDescription('The user whose profile you want to view')
);

export async function execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const user = getUser(target.id);
    const effects = getEffects(target.id);

    const avatar = target.displayAvatarURL({ size: 256 });

    // --- Active Effects ---
    let effectsText = "No active effects.";
    if (effects.length > 0) {
        effectsText = effects.map(e => {
            const remaining = e.expires_at - Math.floor(Date.now() / 1000);
            const minutes = Math.max(1, Math.floor(remaining / 60));
            return `• **${e.effect_id}** — ${minutes} min`;
        }).join("\n");
    }

    // --- Rare Items ---
    const rareItems = db.prepare(`
    SELECT item_id, amount FROM inventory
    WHERE user_id = ? AND item_id IN (
        'diamond', 'artifact', 'sin_r1',
        'gold_trabant', 'tsar_crown', 'golden_lion',
        'pliska_relic', 'kuker_mask', 'golden_lev',
        'st_george_amulet'
    )
    `).all(target.id);

    let rareText = "No rare items.";
    if (rareItems.length > 0) {
        rareText = rareItems.map(r => {
            if (r.item_id === "diamond") return `💎 Diamond Token × ${r.amount}`;
            if (r.item_id === "artifact") return `📿 Ancient Artifact × ${r.amount}`;
            if (r.item_id === "sin_r1") return `🚗 SIN R1 × ${r.amount}`;
            if (r.item_id === "gold_trabant") return `🚙 Golden Trabant × ${r.amount}`;
            if (r.item_id === "tsar_crown") return `👑 Crown of Tsar Simeon × ${r.amount}`;
            if (r.item_id === "golden_lion") return `🦁 Golden Lion × ${r.amount}`;
            if (r.item_id === "pliska_relic") return `🏺 Relic of Pliska × ${r.amount}`;
            if (r.item_id === "kuker_mask") return `🎭 Kuker Mask × ${r.amount}`;
            if (r.item_id === "golden_lev") return `💰 Golden Lev × ${r.amount}`;
            if (r.item_id === "st_george_amulet") return `🛡️ St. George Amulet × ${r.amount}`;
        }).join("\n");
    }

    // --- Special Rank for SIN R1 ---
    let sinRank = "—";
    const hasSin = rareItems.some(r => r.item_id === "sin_r1" && r.amount > 0);
    if (hasSin) {
        sinRank = "🚗 Owner of SIN R1 — Elite Collector";
    }

    // --- Embed ---
    const embed = new EmbedBuilder()
    .setColor('#00A6FF')
    .setTitle(`👤 Profile of ${target.username}`)
    .setThumbnail(avatar)
    .addFields(
        { name: '💰 Balance', value: `€${user.balance}`, inline: true },
        { name: '🏦 Bank', value: `€${user.bank}`, inline: true },
        { name: '💳 Loan', value: `€${user.loan}`, inline: true },
        { name: '📏 Bank Limit', value: `€${user.bank_limit}`, inline: true },
        { name: '👑 VIP Level', value: `${user.vip_level}`, inline: true },
        { name: '🎁 Active Effects', value: effectsText },
        { name: '🏆 Rare Items', value: rareText },
        { name: '🏅 Special Rank', value: sinRank }
    )
    .setFooter({ text: 'CasinoEconomyBot' })
    .setTimestamp();

    // If the user owns a SIN R1 → show image
    if (hasSin) {
        embed.setImage("https://sincars.co.uk/wp-content/uploads/2021/06/SIN-R1-5503.jpg");
    }

    return interaction.reply({ embeds: [embed] });
}
