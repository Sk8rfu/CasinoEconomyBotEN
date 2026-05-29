import { SlashCommandBuilder } from 'discord.js';
import { pendingDuels } from './duel.js';

export const data = new SlashCommandBuilder()
.setName('dueldeny')
.setDescription('Decline the duel');

export async function execute(interaction) {
    const opponent = interaction.user;

    const duel = pendingDuels[opponent.id];
    if (!duel) {
        return interaction.reply("❌ You have no active duel invitations.");
    }

    delete pendingDuels[opponent.id];

    return interaction.reply("❌ The duel has been declined.");
}
