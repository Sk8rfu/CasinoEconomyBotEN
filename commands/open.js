import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
.setName('open')
.setDescription('Open a tile in Mines Multi')
.addIntegerOption(opt =>
opt.setName('tile')
.setDescription('Which tile you want to open (1–25)')
.setRequired(true)
);

export async function execute(interaction) {
    const id = interaction.user.id;
    const pick = interaction.options.getInteger('tile');

    const game = global.minesGames[id];

    if (!game) {
        return interaction.reply({
            content: "❌ You don’t have an active Mines Multi game. Use /minesmulti.",
            flags: 64
        });
    }

    if (pick < 1 || pick > 25) {
        return interaction.reply({ content: "❌ The tile must be between **1 and 25**.", flags: 64 });
    }

    if (game.opened.has(pick)) {
        return interaction.reply({ content: "⚠️ This tile is already opened.", flags: 64 });
    }

    const isMine = game.minePositions.has(pick);

    if (isMine) {
        delete global.minesGames[id];

        const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('💥 Mine!')
        .setDescription(`You hit a mine and lost your bet.`)
        .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }

    // Safe tile
    game.opened.add(pick);
    game.multiplier += 0.25; // increases with every safe tile

    const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('💎 Safe Tile!')
    .setDescription(
        `You successfully opened tile **${pick}**!\n` +
        `Current multiplier: **${game.multiplier.toFixed(2)}x**\n\n` +
        `Open another tile with **/open** or cash out with **/cashout**`
    )
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
