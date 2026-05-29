import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import db, { getUser } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('setvip')
.setDescription('Admin: Set a user’s VIP level')
.addUserOption(opt =>
opt.setName('user')
.setDescription('The user')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('level')
.setDescription('VIP level (0–5)')
.setRequired(true)
)
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
    const target = interaction.options.getUser('user');
    const level = interaction.options.getInteger('level');

    if (level < 0 || level > 5)
        return interaction.reply("❌ VIP level must be between **0 and 5**.");

    // Ensure user exists
    getUser(target.id);

    db.prepare('UPDATE users SET vip_level = ? WHERE id = ?').run(level, target.id);

    const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('👑 VIP Level Set')
    .setDescription(`VIP level for **${target.username}** has been set to **${level}**`)
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
