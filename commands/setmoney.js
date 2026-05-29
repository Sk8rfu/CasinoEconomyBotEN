import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getUser, updateUser } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('setmoney')
.setDescription('Admin: Directly set a user’s balance')
.addUserOption(opt =>
opt.setName('user')
.setDescription('The user')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('amount')
.setDescription('The new balance')
.setRequired(true)
)
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (amount < 0)
        return interaction.reply("❌ The balance cannot be negative.");

    // Ensure user exists
    getUser(target.id);

    updateUser(target.id, { balance: amount });

    const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('💰 Balance Set')
    .setDescription(`The balance of **${target.username}** has been set to **€${amount}**`)
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
