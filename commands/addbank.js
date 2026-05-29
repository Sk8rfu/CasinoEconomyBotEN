import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getUser, updateUser } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('addbank')
.setDescription('Admin: Adds bank limit to a user')
.addUserOption(opt =>
opt.setName('user')
.setDescription('The target user')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('amount')
.setDescription('How much to add to the bank limit')
.setRequired(true)
)
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (amount <= 0)
        return interaction.reply("❌ The amount must be positive.");

    const user = getUser(target.id);
    const newLimit = user.bank_limit + amount;

    updateUser(target.id, { bank_limit: newLimit });

    const embed = new EmbedBuilder()
    .setColor('#0099FF')
    .setTitle('🏦 Bank Limit Increased')
    .setDescription(`The bank limit of **${target.username}** has been increased by **€${amount}**`)
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
