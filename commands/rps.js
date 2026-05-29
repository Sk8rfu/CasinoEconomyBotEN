import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
.setName('rps')
.setDescription('Rock, Paper, Scissors')
.addStringOption(opt =>
opt.setName('choice')
.setDescription('rock, paper, scissors')
.setRequired(true)
);

export async function execute(interaction) {
    const choice = interaction.options.getString('choice').toLowerCase();
    const options = ["rock", "paper", "scissors"];

    if (!options.includes(choice)) {
        return interaction.reply("❌ Choose rock, paper, or scissors.");
    }

    const bot = options[Math.floor(Math.random() * 3)];

    const win =
    (choice === "rock" && bot === "scissors") ||
    (choice === "paper" && bot === "rock") ||
    (choice === "scissors" && bot === "paper");

    const lose =
    (choice === "rock" && bot === "paper") ||
    (choice === "paper" && bot === "scissors") ||
    (choice === "scissors" && bot === "rock");

    const result = win ? "🎉 You win!" : lose ? "💀 You lose." : "🤝 It's a tie.";

    const embed = new EmbedBuilder()
    .setColor('#1E90FF')
    .setTitle('✊📄✂️ Rock, Paper, Scissors')
    .addFields(
        { name: 'Your Choice', value: choice, inline: true },
        { name: 'Bot Choice', value: bot, inline: true },
        { name: 'Result', value: result }
    )
    .setTimestamp()
    .setFooter({ text: 'CasinoEconomyBot — RPS' });

    return interaction.reply({ embeds: [embed] });
}
