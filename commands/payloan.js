import { SlashCommandBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('payloan')
.setDescription('Repay part or all of your loan')
.addIntegerOption(opt =>
opt.setName('amount')
.setDescription('How much you want to pay')
.setRequired(true)
);

export async function execute(interaction) {
    const id = interaction.user.id;
    const amount = interaction.options.getInteger('amount');
    const user = getUser(id);

    if (user.loan <= 0) {
        return interaction.reply('❌ You have no active loan.');
    }

    if (amount <= 0) {
        return interaction.reply('❌ The amount must be a positive number.');
    }

    if (user.balance < amount) {
        return interaction.reply('❌ You don’t have enough money.');
    }

    updateBalance(id, -amount);

    let remaining = user.loan - amount;
    if (remaining < 0) remaining = 0;

    const db = (await import('../db.js')).default;
    db.prepare('UPDATE users SET loan = ? WHERE id = ?').run(remaining, id);

    return interaction.reply(
        `💸 You paid **€${amount}** toward your loan.\n` +
        `📘 Remaining balance: **€${remaining}**`
    );
}
