import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getUser, updateUser } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('removebank')
.setDescription('Admin: Remove bank limit from a user')
.addUserOption(opt =>
opt.setName('user')
.setDescription('The user')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('amount')
.setDescription('How much to remove (0 = reset)')
.setRequired(true)
)
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    const user = getUser(target.id);

    if (amount < 0)
        return interaction.reply("❌ The amount must be 0 or higher.");

    let removed = amount;

    // If amount = 0 → full reset
    if (amount === 0) {
        removed = user.bank_limit;
        updateUser(target.id, { bank_limit: 0 });
    } else {
        removed = Math.min(user.bank_limit, amount);
        updateUser(target.id, { bank_limit: user.bank_limit - removed });
    }

    const embed = new EmbedBuilder()
    .setColor('#FF3333')
    .setTitle('🏦 Bank Limit Removal')
    .setDescription(`Removed **€${removed}** from the bank limit of **${target.username}**`)
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
