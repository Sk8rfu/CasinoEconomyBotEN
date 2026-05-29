import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
.setName('about')
.setDescription('Information about the bot');

export async function execute(interaction) {

    const embed = new EmbedBuilder()
    .setColor('#00CED1')
    .setTitle('🤖 CasinoEconomyBot — Economy Discord Bot')
    .setDescription('💰 *Economy • Games • PvP • Shop • Effects*')
    .addFields(
        {
            name: '🎮 Main Features',
            value:
            '• Economy: balance, bank, loans\n' +
            '• Shop with items, effects and boosts\n' +
            '• Inventory and item usage system\n' +
            '• Gambling games: Slots, Blackjack, Roulette, Poker, Coinflip\n' +
            '• PvP duels with weapons, shields and effects\n' +
            '• Crime system: Crime & Rob\n' +
            '• Ranks, VIP levels, profiles, leaderboards'
        },
        {
            name: '👑 Created by',
            value: 'Sk8rfu'
        },
        {
            name: '📌 Useful Commands',
            value: '/help — list of all commands'
        }
    )
    .setFooter({ text: 'CasinoEconomyBot — Information' })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
