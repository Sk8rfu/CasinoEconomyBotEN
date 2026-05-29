import { SlashCommandBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('loan')
.setDescription('Take a loan from the bank')
.addIntegerOption(opt =>
opt.setName('amount')
.setDescription('Loan amount')
.setRequired(true)
);

export async function execute(interaction) {
    const id = interaction.user.id;
    const amount = interaction.options.getInteger('amount');
    const user = getUser(id);

    if (user.loan > 0) {
        return interaction.reply('❌ You must repay your current loan first.');
    }

    if (amount <= 0 || amount > 10000) {
        return interaction.reply('❌ You can take a loan between **1 and 10,000 €**.');
    }

    const interestRate = 1.20; // +20% interest
    const loanWithInterest = Math.floor(amount * interestRate);

    updateBalance(id, amount);

    // Save the loan
    user.loan = loanWithInterest;
    const db = (await import('../db.js')).default;
    db.prepare('UPDATE users SET loan = ? WHERE id = ?').run(loanWithInterest, id);

    return interaction.reply(
        `🏦 You took a loan of **€${amount}**.\n` +
        `📌 With interest, you must repay: **€${loanWithInterest}** (+20%)`
    );
}
