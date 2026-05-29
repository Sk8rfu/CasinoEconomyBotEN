import { SlashCommandBuilder } from 'discord.js';
import { getUser, updateBalance, updateBank } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('bank')
.setDescription('Bank operations')
.addSubcommand(sub =>
sub
.setName('deposit')
.setDescription('Deposit money into your bank')
.addIntegerOption(opt =>
opt.setName('amount')
.setDescription('Amount to deposit')
.setRequired(true)
)
)
.addSubcommand(sub =>
sub
.setName('withdraw')
.setDescription('Withdraw money from your bank')
.addIntegerOption(opt =>
opt.setName('amount')
.setDescription('Amount to withdraw')
.setRequired(true)
)
);

export async function execute(interaction) {
    const id = interaction.user.id;
    const user = getUser(id);
    const sub = interaction.options.getSubcommand();
    const amount = interaction.options.getInteger('amount');

    if (amount <= 0) {
        return interaction.reply('❌ The amount must be a positive number.');
    }

    if (sub === 'deposit') {
        if (user.balance < amount) {
            return interaction.reply('❌ You do not have that much money in your wallet.');
        }

        const newBank = updateBank(id, amount);

        if (newBank === false) {
            return interaction.reply(`❌ You cannot deposit that much. Your bank limit is **€${user.bank_limit}**.`);
        }

        updateBalance(id, -amount);

        return interaction.reply(`🏦 Deposited **€${amount}**.\n📘 Bank: **€${newBank}**`);
    }

    if (sub === 'withdraw') {
        if (user.bank < amount) {
            return interaction.reply('❌ You do not have that much money in your bank.');
        }

        updateBank(id, -amount);
        const newBalance = updateBalance(id, amount);

        return interaction.reply(`💸 Withdrew **€${amount}**.\n💰 Wallet: **€${newBalance}**`);
    }
}
