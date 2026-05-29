import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import db, { getUser } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('resetcooldown')
.setDescription('Admin: Reset all cooldowns for a user')
.addUserOption(opt =>
opt.setName('user')
.setDescription('The user whose cooldowns will be reset')
.setRequired(true)
)
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
    const target = interaction.options.getUser('user');

    // Ensure user exists in DB
    getUser(target.id);

    db.prepare(`
    UPDATE users SET
    last_daily = NULL,
    last_weekly = NULL,
    last_monthly = NULL,
    last_work = NULL,
    last_rob = NULL,
    vipdaily_last = NULL,
    vipweekly_last = NULL,
    vipmonthly_last = NULL
    WHERE id = ?
    `).run(target.id);

    const embed = new EmbedBuilder()
    .setColor('#FF4444')
    .setTitle('🔄 Cooldowns Reset')
    .setDescription(`All cooldowns (including VIP cooldowns) for **${target.username}** have been successfully reset.`)
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
