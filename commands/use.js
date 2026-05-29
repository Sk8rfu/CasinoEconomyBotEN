import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../db.js';
import { getUser, updateUser, addEffect } from '../db.js';
import { items } from './shop.js';

export const data = new SlashCommandBuilder()
.setName('use')
.setDescription('Use an item from your inventory')
.addStringOption(opt =>
opt.setName('id')
.setDescription('ID of the item')
.setRequired(true)
);

export async function execute(interaction) {
    const userId = interaction.user.id;
    const itemId = interaction.options.getString('id');
    const user = getUser(userId);

    const inv = db.prepare(`
    SELECT amount FROM inventory WHERE user_id = ? AND item_id = ?
    `).get(userId, itemId);

    if (!inv || inv.amount <= 0)
        return interaction.reply("❌ You don’t have this item.");

    const item = items.find(i => i.id === itemId);
    if (!item) return interaction.reply("❌ Invalid item.");

    let message = "";

    // ---------------- VIP ----------------
    if (itemId.startsWith("vip")) {
        const newLevel = Number(itemId.replace("vip", ""));

        if (newLevel > 5)
            return interaction.reply("❌ Maximum VIP level is 5.");

        if (user.vip_level >= newLevel)
            return interaction.reply("❌ You already have this VIP level or higher.");

        updateUser(userId, { vip_level: newLevel });
        message = `👑 Your VIP level has been upgraded to **${newLevel}**!`;
    }

    // ---------------- BOOSTS ----------------
    const boosts = {
        boost_slots: { time: 3600, msg: "🎰 Slots Boost activated for 1 hour!" },
        boost_blackjack: { time: 3600, msg: "🃏 Blackjack Boost activated for 1 hour!" },
        boost_duel: { time: 1800, msg: "⚔️ Duel Boost activated for 30 minutes!" },
        luck_small: { time: 3600, msg: "🍀 Small Luck activated for 1 hour!" },
        luck_big: { time: 86400, msg: "🌟 Big Luck activated for 24 hours!" },
        crime_mask: { time: 3600, msg: "🦹 Crime Mask activated for 1 hour!" },
        rob_gloves: { time: 3600, msg: "🧤 Robbery Gloves activated for 1 hour!" },
        pvp_sword: { time: 1800, msg: "⚔️ Duel Sword activated for 30 minutes!" },
        pvp_shield: { time: 1800, msg: "🛡️ Duel Shield activated for 30 minutes!" }
    };

    if (boosts[itemId]) {
        addEffect(userId, itemId, boosts[itemId].time);
        message = boosts[itemId].msg;
    }

    // ---------------- CONSUMABLES ----------------
    if (itemId === "heal") {
        message = "🧪 You used a Healing Potion!";
    }

    if (itemId === "energy") {
        addEffect(userId, "energy", 3600);
        message = "⚡ You reduced the cooldown of /work!";
    }

    // ---------------- SPECIAL ITEMS ----------------
    if (itemId === "loan_cut") {
        const newLoan = Math.floor(user.loan * 0.9);
        updateUser(userId, { loan: newLoan });
        message = "💳 Your loan has been reduced by 10%!";
    }

    if (itemId === "bank_ticket") {
        const newLimit = user.bank_limit + 5000;
        updateUser(userId, { bank_limit: newLimit });
        message = "🏦 Your bank limit increased by **+5,000€**!";
    }

    if (itemId === "bank_card") {
        const increase = Math.floor(user.bank_limit * 0.20);
        const newLimit = user.bank_limit + increase;
        updateUser(userId, { bank_limit: newLimit });
        message = `💳 Bank Card increased your bank limit by **+${increase}€**!`;
    }

    if (itemId === "bank_card_gold") {
        const newLimit = user.bank_limit + 10000;
        updateUser(userId, { bank_limit: newLimit });
        message = "💳✨ GOLD Bank Card increased your bank limit by **+10,000€**!";
    }

    if (itemId === "bank_card_platinum") {
        const newLimit = user.bank_limit + 25000;
        updateUser(userId, { bank_limit: newLimit });
        message = "💳💠 PLATINUM Bank Card increased your bank limit by **+25,000€**!";
    }

    if (itemId === "bank_card_diamond") {
        const newLimit = user.bank_limit + 50000;
        updateUser(userId, { bank_limit: newLimit });
        message = "💳💎 DIAMOND Bank Card increased your bank limit by **+50,000€**!";
    }

    if (itemId === "phoenix") {
        addEffect(userId, "phoenix", 604800);
        message = "🔥 Phoenix Feather will save you from your next loss!";
    }

    // Rare items — cannot be used
    if ([
        "diamond", "artifact", "sin_r1",
        "gold_trabant", "tsar_crown", "golden_lion",
        "pliska_relic", "kuker_mask", "golden_lev",
        "st_george_amulet"
    ].includes(itemId)) {
        return interaction.reply("💎 This item cannot be used.");
    }

    // ---------------- REMOVE ITEM ----------------
    db.prepare(`
    UPDATE inventory SET amount = amount - 1
    WHERE user_id = ? AND item_id = ?
    `).run(userId, itemId);

    // ---------------- EMBED ----------------
    const embed = new EmbedBuilder()
    .setColor('#00A6FF')
    .setTitle(`🎒 Used item: ${item.name}`)
    .setDescription(message)
    .setFooter({ text: 'CasinoEconomyBot — Inventory' })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
