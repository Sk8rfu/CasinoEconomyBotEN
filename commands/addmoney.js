import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('addmoney')
.setDescription('Admin: Adds money to a user')
.addUserOption(opt =>
opt.setName('user')
.setDescription('The user to receive the money')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('amount')
.setDescription('The amount to add')
.setRequired(true)
);

export async function execute(interaction) {

    // Admin check
    if (!interaction.member.permissions.has('Administrator'))
        return interaction.reply("❌ You do not have permission to use this command.");

    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (amount <= 0)
        return interaction.reply("❌ The amount must be a positive number.");

    updateBalance(target.id, amount);

    const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('💰 Money Added')
    .setDescription(`**€${amount}** has been added to **${target.username}**`)
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
