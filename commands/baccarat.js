import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('baccarat')
.setDescription('Play Baccarat — choose Player, Banker or Tie')
.addIntegerOption(opt =>
opt.setName('bet')
.setDescription('How much you want to bet')
.setRequired(true)
)
.addStringOption(opt =>
opt.setName('choice')
.setDescription('Player, Banker or Tie')
.addChoices(
    { name: 'Player', value: 'player' },
    { name: 'Banker', value: 'banker' },
    { name: 'Tie', value: 'tie' }
)
.setRequired(true)
);

function drawCard() {
    return Math.floor(Math.random() * 10); // 0–9
}

function baccaratSum(cards) {
    const total = cards.reduce((a, b) => a + b, 0);
    return total % 10;
}

export async function execute(interaction) {
    const id = interaction.user.id;
    const bet = interaction.options.getInteger('bet');
    const choice = interaction.options.getString('choice');
    const user = getUser(id);

    if (bet <= 0) {
        return interaction.reply({ content: "❌ The bet must be a positive number.", flags: 64 });
    }

    if (user.balance < bet) {
        return interaction.reply({ content: "❌ You don't have enough money.", flags: 64 });
    }

    // Player cards
    const playerCards = [drawCard(), drawCard()];
    let playerSum = baccaratSum(playerCards);

    // Banker cards
    const bankerCards = [drawCard(), drawCard()];
    let bankerSum = baccaratSum(bankerCards);

    // Third card rule (simplified)
    if (playerSum <= 5) {
        playerCards.push(drawCard());
        playerSum = baccaratSum(playerCards);
    }

    if (bankerSum <= 5) {
        bankerCards.push(drawCard());
        bankerSum = baccaratSum(bankerCards);
    }

    let winner = "";
    if (playerSum > bankerSum) winner = "player";
    else if (bankerSum > playerSum) winner = "banker";
    else winner = "tie";

    // Multipliers
    const multipliers = {
        player: 2,
        banker: 1.95,
        tie: 8
    };

    let win = 0;

    if (choice === winner) {
        const vipBonus = 1 + user.vip_level * 0.05;
        win = Math.floor(bet * multipliers[winner] * vipBonus);
        updateBalance(id, win);
    } else {
        updateBalance(id, -bet);
    }

    const embed = new EmbedBuilder()
    .setColor(choice === winner ? '#00FF00' : '#FF0000')
    .setTitle('🃏 Baccarat — Result')
    .addFields(
        { name: "Player", value: `${playerCards.join(", ")} → **${playerSum}**`, inline: true },
               { name: "Banker", value: `${bankerCards.join(", ")} → **${bankerSum}**`, inline: true }
    )
    .addFields(
        { name: "Your Choice", value: choice, inline: true },
        { name: "Winner", value: winner, inline: true },
        { name: "Winnings", value: `€${win}`, inline: true }
    )
    .setFooter({ text: "CasinoEconomyBot — Baccarat" })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
