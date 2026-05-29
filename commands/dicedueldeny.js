import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
.setName('dicedueldeny')
.setDescription('Decline a Dice Duel challenge');

export async function execute(interaction) {
    const id = interaction.user.id;

    if (!global.diceDuels[id]) {
        return interaction.reply({ content: "❌ You have no challenges to decline.", flags: 64 });
    }

    delete global.diceDuels[id];

    return interaction.reply({ content: "❌ You declined the duel.", flags: 64 });
}
