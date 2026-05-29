import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function drawCard() {
    return ranks[Math.floor(Math.random() * ranks.length)] +
    suits[Math.floor(Math.random() * suits.length)];
}

function getValue(card) {
    return card.replace(/[^A-Z0-9]/g, "");
}

function evaluateHand(hand) {
    const values = hand.map(getValue);
    const counts = {};
    for (const v of values) counts[v] = (counts[v] || 0) + 1;

    const isFlush = hand.every(c => c.slice(-1) === hand[0].slice(-1));
    const order = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
    const sorted = values.map(v => order.indexOf(v)).sort((a,b)=>a-b);
    const isStraight = sorted.every((v,i)=>i===0 || v===sorted[i-1]+1);

    const pairs = Object.values(counts).filter(c => c === 2).length;
    const threes = Object.values(counts).includes(3);
    const fours = Object.values(counts).includes(4);

    if (isStraight && isFlush && values.includes("A") && values.includes("K"))
        return {name:"Royal Flush", mult:100};
    if (isStraight && isFlush) return {name:"Straight Flush", mult:40};
    if (fours) return {name:"Four of a Kind", mult:25};
    if (threes && pairs === 1) return {name:"Full House", mult:15};
    if (isFlush) return {name:"Flush", mult:10};
    if (isStraight) return {name:"Straight", mult:8};
    if (threes) return {name:"Three of a Kind", mult:5};
    if (pairs === 2) return {name:"Two Pair", mult:3};
    if (pairs === 1) return {name:"Pair", mult:2};

    return {name:"High Card", mult:0};
}

export const data = new SlashCommandBuilder()
.setName('poker')
.setDescription('Play 5‑card poker against the dealer')
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

    const player = [drawCard(), drawCard(), drawCard(), drawCard(), drawCard()];
    const dealer = [drawCard(), drawCard(), drawCard(), drawCard(), drawCard()];

    const pEval = evaluateHand(player);
    const dEval = evaluateHand(dealer);

    let win = 0;
    let result = "";

    if (pEval.mult > dEval.mult) {
        win = Math.floor(bet * pEval.mult * (1 + user.vip_level * 0.1));
        result = `🎉 You won with **${pEval.name}**!`;
    } else if (pEval.mult < dEval.mult) {
        result = `💀 You lost. The dealer had **${dEval.name}**.`;
    } else {
        win = bet;
        result = "🤝 It's a tie — your bet is returned.";
    }

    updateBalance(id, -bet + win);

    const embed = new EmbedBuilder()
    .setColor('#800080')
    .setTitle('♠️ Poker — 5 Card Draw')
    .addFields(
        { name: 'Your Cards', value: `${player.join(" ")}` },
               { name: 'Your Hand', value: pEval.name, inline: true },
               { name: 'Dealer Cards', value: `${dealer.join(" ")}` },
               { name: 'Dealer Hand', value: dEval.name, inline: true },
               { name: 'Result', value: result }
    )
    .setFooter({ text: win > 0 ? `Winnings: €${win}` : `Loss: €${bet}` })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
