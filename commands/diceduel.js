import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser } from '../db.js';

global.diceDuels = global.diceDuels || {};

export const data = new SlashCommandBuilder()
.setName('diceduel')
.setDescription('Challenge a player to a Dice Duel')
.addUserOption(opt =>
opt.setName('player')
.setDescription('Who you want to challenge')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('bet')
.setDescription('The bet amount for the duel')
.setRequired(true)
);

export async function execute(interaction) {
    const challenger = interaction.user;
    const opponent = interaction.options.getUser('player');
    const bet = interaction.options.getInteger('bet');

    if (challenger.id === opponent.id) {
        return interaction.reply({ content: "❌ You cannot challenge yourself.", flags: 64 });
    }

    const user1 = getUser(challenger.id);
    const user2 = getUser(opponent.id);

    if (user1.balance < bet) {
        return interaction.reply({ content: "❌ You don’t have enough money.", flags: 64 });
    }

    if (user2.balance < bet) {
        return interaction.reply({ content: "❌ The opponent doesn’t have enough money.", flags: 64 });
    }

    global.diceDuels[opponent.id] = {
        challenger: challenger.id,
        bet
    };

    const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('🎲 Dice Duel — Challenge')
    .setDescription(
        `${challenger.username} has challenged ${opponent.username}!\n` +
        `Bet: **€${bet}**\n\n` +
        `👉 ${opponent}, use **/diceduelaccept** or **/dicedueldeny**`
    );

    return interaction.reply({ embeds: [embed] });
}
