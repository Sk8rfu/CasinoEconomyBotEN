import { SlashCommandBuilder } from 'discord.js';
import { getUser, updateBalance, hasEffect, removeEffect } from '../db.js';
import { pendingDuels } from './duel.js';

export const data = new SlashCommandBuilder()
.setName('duelaccept')
.setDescription('Accept the duel');

export async function execute(interaction) {
    const opponent = interaction.user;

    const duel = pendingDuels[opponent.id];
    if (!duel) {
        return interaction.reply("❌ You have no active duel invitations.");
    }

    const challengerId = duel.challenger;
    const bet = duel.bet;

    const challenger = await interaction.client.users.fetch(challengerId);

    const cData = getUser(challengerId);
    const oData = getUser(opponent.id);

    // Money check
    if (cData.balance < bet || oData.balance < bet) {
        delete pendingDuels[opponent.id];
        return interaction.reply("❌ One of the players does not have enough money.");
    }

    // --- Base hits ---
    let cHit = Math.floor(Math.random() * 100) + 1 + cData.vip_level * 5;
    let oHit = Math.floor(Math.random() * 100) + 1 + oData.vip_level * 5;

    // --- PvP Effects ---

    // ⚔️ Duel Boost (+20 power)
    if (hasEffect(challengerId, "boost_duel")) cHit += 20;
    if (hasEffect(opponent.id, "boost_duel")) oHit += 20;

    // 🗡️ Duel Sword (+30 attack)
    if (hasEffect(challengerId, "pvp_sword")) cHit += 30;
    if (hasEffect(opponent.id, "pvp_sword")) oHit += 30;

    // 🛡️ Duel Shield (+30 defense)
    if (hasEffect(challengerId, "pvp_shield")) oHit -= 30;
    if (hasEffect(opponent.id, "pvp_shield")) cHit -= 30;

    // 🍀 Luck Small (+5)
    if (hasEffect(challengerId, "luck_small")) cHit += 5;
    if (hasEffect(opponent.id, "luck_small")) oHit += 5;

    // 🍀 Luck Big (+15)
    if (hasEffect(challengerId, "luck_big")) cHit += 15;
    if (hasEffect(opponent.id, "luck_big")) oHit += 15;

    // Minimum hit cannot drop below 1
    cHit = Math.max(1, cHit);
    oHit = Math.max(1, oHit);

    let result = "";
    let winner = null;

    // --- Challenger wins ---
    if (cHit > oHit) {
        winner = challenger;

        // 🔥 Phoenix Feather saves from loss
        if (hasEffect(opponent.id, "phoenix")) {
            removeEffect(opponent.id, "phoenix");
            delete pendingDuels[opponent.id];
            return interaction.reply(
                `⚔️ **Duel: ${challenger.username} vs ${opponent.username}**\n\n` +
                `🔸 ${challenger.username}: hit **${cHit}**\n` +
                `🔹 ${opponent.username}: hit **${oHit}**\n\n` +
                `🔥 Phoenix Feather saved ${opponent.username} from losing!\n` +
                `🤝 The bet is refunded.`
            );
        }

        updateBalance(challengerId, bet);
        updateBalance(opponent.id, -bet);
        result = `🗡️ **${challenger.username} wins!**`;

        // --- Opponent wins ---
    } else if (oHit > cHit) {
        winner = opponent;

        // 🔥 Phoenix Feather saves from loss
        if (hasEffect(challengerId, "phoenix")) {
            removeEffect(challengerId, "phoenix");
            delete pendingDuels[opponent.id];
            return interaction.reply(
                `⚔️ **Duel: ${challenger.username} vs ${opponent.username}**\n\n` +
                `🔸 ${challenger.username}: hit **${cHit}**\n` +
                `🔹 ${opponent.username}: hit **${oHit}**\n\n` +
                `🔥 Phoenix Feather saved ${challenger.username} from losing!\n` +
                `🤝 The bet is refunded.`
            );
        }

        updateBalance(opponent.id, bet);
        updateBalance(challengerId, -bet);
        result = `🗡️ **${opponent.username} wins!**`;

        // --- Tie ---
    } else {
        result = "🤝 It's a tie — nobody loses.";
    }

    delete pendingDuels[opponent.id];

    return interaction.reply(
        `⚔️ **Duel: ${challenger.username} vs ${opponent.username}**\n\n` +
        `🔸 ${challenger.username}: hit **${cHit}**\n` +
        `🔹 ${opponent.username}: hit **${oHit}**\n\n` +
        `${result}\n` +
        (winner ? `💰 The winner earns **€${bet}**` : "")
    );
}
