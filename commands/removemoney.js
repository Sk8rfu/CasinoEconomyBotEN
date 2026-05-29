import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('removemoney')
.setDescription('Admin: Remove money from a user')
.addUserOption(opt =>
opt.setName('user')
.setDescription('The user to remove money from')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('amount')
.setDescription('Amount to remove (0 = reset)')
.setRequired(true)
);

export async function execute(interaction) {

    // Admin check
    if (!interaction.member.permissions.has('Administrator'))
        return interaction.reply("❌ You do not have permission to use this command.");

    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    const user = getUser(target.id);

    let removed = amount;

    if (amount < 0)
        return interaction.reply("❌ The amount must be 0 or higher.");

    // If amount = 0 → reset balance
    if (amount === 0) {
        removed = user.balance;
        updateBalance(target.id, -user.balance);
    } else {
        removed = Math.min(user.balance, amount);
        updateBalance(target.id, -removed);
    }

    const embed = new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle('💸 Money Removed')
    .setDescription(`Removed **€${removed}** from **${target.username}**`)
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
