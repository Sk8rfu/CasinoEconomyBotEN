import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

global.minesGames = global.minesGames || {};

export const data = new SlashCommandBuilder()
.setName('minesmulti')
.setDescription('Start a Mines Multi game')
.addIntegerOption(opt =>
opt.setName('bet')
.setDescription('How much you want to bet')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('mines')
.setDescription('Number of mines (1–10)')
.setRequired(true)
);

export async function execute(interaction) {
    const id = interaction.user.id;
    const bet = interaction.options.getInteger('bet');
    const mines = interaction.options.getInteger('mines');
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

    // If the user already has an active game
    if (global.minesGames[id]) {
        return interaction.reply({
            content: "⚠️ You already have an active Mines Multi game. Use /open or /cashout.",
            flags: 64
        });
    }

    // Generate mine positions
    const minePositions = new Set();
    while (minePositions.size < mines) {
        minePositions.add(Math.floor(Math.random() * 25) + 1);
    }

    // Save the game state
    global.minesGames[id] = {
        bet,
        mines,
        minePositions,
        opened: new Set(),
        multiplier: 1.0
    };

    updateBalance(id, -bet);

    const embed = new EmbedBuilder()
    .setColor('#00AAFF')
    .setTitle('💣 Mines Multi — Game Started')
    .setDescription(
        `Bet: **€${bet}**\nMines: **${mines}**\n\n` +
        `Open a tile using **/open tile:number** (1–25)\n` +
        `When you're ready, use **/cashout**`
    )
    .setFooter({ text: "CasinoEconomyBot — Mines Multi" })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
