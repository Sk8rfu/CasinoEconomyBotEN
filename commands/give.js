import { SlashCommandBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('give')
.setDescription('Give money to another user')
.addUserOption(opt =>
opt.setName('user')
.setDescription('Who you want to give money to')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('amount')
.setDescription('How much money to give')
.setRequired(true)
);

export async function execute(interaction) {
    const sender = interaction.user;
    const receiver = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (receiver.id === sender.id) {
        return interaction.reply('❌ You cannot give money to yourself.');
    }

    if (amount <= 0) {
        return interaction.reply('❌ The amount must be a positive number.');
    }

    const senderData = getUser(sender.id);

    if (senderData.balance < amount) {
        return interaction.reply('❌ You don’t have enough money.');
    }

    updateBalance(sender.id, -amount);
    const newReceiverBalance = updateBalance(receiver.id, amount);

    return interaction.reply(
        `🤝 **${sender.username}** gave **€${amount}** to **${receiver.username}**!\n` +
        `💰 New balance for ${receiver.username}: **€${newReceiverBalance}**`
    );
}
