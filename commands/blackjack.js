import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance, hasEffect, removeEffect } from '../db.js';

const cards = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function drawCard() {
    return cards[Math.floor(Math.random() * cards.length)];
}

function cardValue(card) {
    if (card === "A") return 11;
    if (["J", "Q", "K"].includes(card)) return 10;
    return parseInt(card);
}

function calculateHand(hand) {
    let total = hand.reduce((sum, c) => sum + cardValue(c), 0);
    let aces = hand.filter(c => c === "A").length;

    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }
    return total;
}

export const data = new SlashCommandBuilder()
.setName('blackjack')
.setDescription('Play Blackjack against the dealer')
.addIntegerOption(opt =>
opt.setName('bet')
.setDescription('How much you want to bet')
.setRequired(true)
);

export async function execute(interaction) {
    const id = interaction.user.id;
    const bet = interaction.options.getInteger('bet');
    const user = getUser(id);

    if (bet <= 0) return interaction.reply("❌ The bet must be a positive number.");
    if (user.balance < bet) return interaction.reply("❌ You don’t have enough money.");

    const boosted = hasEffect(id, "boost_blackjack");

    let player = [drawCard(), drawCard()];
    while (calculateHand(player) < (boosted ? 16 : 17)) player.push(drawCard());

    let dealer = [drawCard(), drawCard()];
    while (calculateHand(dealer) < (boosted ? 19 : 17)) dealer.push(drawCard());

    const playerTotal = calculateHand(player);
    const dealerTotal = calculateHand(dealer);

    let result = "";
    let win = 0;

    // 🎯 Main logic
    if (playerTotal > 21) {
        result = "💀 Bust! You lost.";
    }
    else if (dealerTotal > 21 || playerTotal > dealerTotal) {
        result = "🎉 You beat the dealer!";
        win = Math.floor(bet * (1 + user.vip_level * 0.1));
    }
    else if (playerTotal === dealerTotal) {
        result = "🤝 Tie — your bet is returned.";
        win = bet;
    }
    else {
        result = "💀 You lost.";
    }

    // 🍀 Luck Small → turns a tie into a win
    if (hasEffect(id, "luck_small")) {
        if (playerTotal === dealerTotal) {
            result = "🍀 Luck is on your side — you win!";
            win = Math.floor(bet * (1 + user.vip_level * 0.1));
        }
    }

    // 🌟 Luck Big → 15% chance to turn a loss into a tie
    if (hasEffect(id, "luck_big")) {
        if (result === "💀 You lost." && Math.random() < 0.15) {
            result = "🌟 Big luck — you were saved from losing!";
            win = bet;
        }
    }

    // 🔥 Phoenix Feather → saves you from losing once
    if (result === "💀 You lost." && hasEffect(id, "phoenix")) {
        removeEffect(id, "phoenix");
        result = "🔥 Phoenix Feather saved you from losing!";
        win = bet;
    }

    updateBalance(id, -bet + win);

    const embed = new EmbedBuilder()
    .setColor('#228B22')
    .setTitle('🃏 Blackjack')
    .addFields(
        { name: 'Your Cards', value: `${player.join(", ")} → **${playerTotal}**` },
               { name: 'Dealer Cards', value: `${dealer.join(", ")} → **${dealerTotal}**` },
               { name: 'Result', value: result }
    )
    .setFooter({ text: win > 0 ? `Winnings: €${win}` : `Loss: €${bet}` })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
