import { SlashCommandBuilder } from 'discord.js';
import { getUser } from '../db.js';

export const pendingDuels = {};

export const data = new SlashCommandBuilder()
.setName('duel')
.setDescription('Challenge another player to a duel')
.addUserOption(opt =>
opt.setName('player')
.setDescription('Who you want to challenge')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('bet')
.setDescription('How much you want to wager')
.setRequired(true)
);

export async function execute(interaction) {
    const challenger = interaction.user;
    const opponent = interaction.options.getUser('player');
    const bet = interaction.options.getInteger('bet');

    if (challenger.id === opponent.id) {
        return interaction.reply("❌ You cannot duel yourself.");
    }

    const cData = getUser(challenger.id);
    const oData = getUser(opponent.id);

    if (cData.balance < bet) {
        return interaction.reply("❌ You don’t have enough money.");
    }

    if (oData.balance < bet) {
        return interaction.reply(`❌ ${opponent.username} doesn’t have enough money.`);
    }

    // Store the duel
    pendingDuels[opponent.id] = {
        challenger: challenger.id,
        bet: bet
    };

    return interaction.reply(
        `⚔️ **${challenger.username} has challenged ${opponent.username} to a duel for €${bet}!**\n` +
        `👉 ${opponent.username}, use **/duelaccept** or **/dueldeny**`
    );
}
