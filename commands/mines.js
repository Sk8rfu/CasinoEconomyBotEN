import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('mines')
.setDescription('Play Mines — pick a tile and hope it’s not a mine!')
.addIntegerOption(opt =>
opt.setName('bet')
.setDescription('How much you want to bet')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('mines')
.setDescription('Number of mines (1–10)')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('tile')
.setDescription('Which tile you open (1–25)')
.setRequired(true)
);

export async function execute(interaction) {
    const id = interaction.user.id;
    const bet = interaction.options.getInteger('bet');
    const mines = interaction.options.getInteger('mines');
    const pick = interaction.options.getInteger('tile');
    const user = getUser(id);

    if (bet <= 0) {
        return interaction.reply({ content: "❌ The bet must be a positive number.", flags: 64 });
    }

    if (user.balance < bet) {
        return interaction.reply({ content: "❌ You don’t have enough money.", flags: 64 });
    }

    if (mines < 1 || mines > 10) {
        return interaction.reply({ content: "❌ Mines must be between **1 and 10**.", flags: 64 });
    }

    if (pick < 1 || pick > 25) {
        return interaction.reply({ content: "❌ The tile must be between **1 and 25**.", flags: 64 });
    }

    // Generate mine positions
    const minePositions = new Set();
    while (minePositions.size < mines) {
        minePositions.add(Math.floor(Math.random() * 25) + 1);
    }

    const isMine = minePositions.has(pick);

    // VIP bonus
    const vipBonus = 1 + user.vip_level * 0.05;

    let win = 0;
    let resultText = "";
    let color = "#FF0000";

    if (isMine) {
        updateBalance(id, -bet);
        resultText = `💥 You hit a **mine**! You lost **€${bet}**.`;
    } else {
        // More mines = higher multiplier
        const multiplier = 1 + (mines * 0.25);
        win = Math.floor(bet * multiplier * vipBonus);

        updateBalance(id, win - bet);
        resultText = `🎉 Safe tile! You win **€${win}**!`;
        color = "#00FF00";
    }

    // Visual 5x5 board
    let board = "";
    for (let i = 1; i <= 25; i++) {
        if (i === pick) {
            board += isMine ? "💣 " : "💎 ";
        } else {
            board += "⬛ ";
        }
        if (i % 5 === 0) board += "\n";
    }

    const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle("💣 Mines Game")
    .setDescription(resultText)
    .addFields(
        { name: "Bet", value: `€${bet}`, inline: true },
        { name: "Mines", value: `${mines}`, inline: true },
        { name: "Tile", value: `${pick}`, inline: true }
    )
    .addFields({ name: "5x5 Board", value: board })
    .setFooter({ text: "CasinoEconomyBot — Mines" })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
