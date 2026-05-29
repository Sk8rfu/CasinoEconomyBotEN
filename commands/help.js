import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
.setName('help')
.setDescription('Shows all commands and their descriptions');

export async function execute(interaction) {

    const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('📘 Help Menu — Commands')
    .setDescription('All available commands, organized by category.')
    .addFields(
        {
            name: '💰 Economy',
            value:
            '/balance • /bank • /loan • /payloan\n' +
            '/work • /daily • /weekly • /monthly\n' +
            '/give'
        },
        {
            name: '🛒 Shop & Inventory',
            value:
            '/shop • /buy • /sell • /inventory\n' +
            '/use • /trade • /effects'
        },
        {
            name: '🎰 Gambling Games',
            value:
            '/slots • /slots10 • /slots50 • /blackjack\n' +
            '/roulette • /poker • /coinflip • /rps • /yahtzee\n' +
            '/crash • /mines • /minesmulti • /open • /cashout\n' +
            '/cardflip • /plinko • /dicebot • /baccarat'
        },
        {
            name: '⚔️ PvP Duel',
            value:
            '/duel • /duelaccept • /dueldeny\n' +
            '/diceduel • /diceduelaccept • /dicedueldeny'
        },
        {
            name: '🦹 Crimes',
            value: '/crime • /rob'
        },
        {
            name: '🎁 Mystery Box',
            value: '/mysterybox'
        },
        {
            name: '🎡 Daily Spin',
            value: '/spin — spin the wheel of luck (24 hours)'
        },
        {
            name: '🏆 Jackpot',
            value:
            '/jackpot — view participants and chances\n' +
            '/jackpotdraw — draw a winner (admin)'
        },
        {
            name: '👑 VIP Commands',
            value: '/vip • /vipdaily • /vipweekly • /vipmonthly'
        },
        {
            name: '🏆 Statistics',
            value: '/profile • /leaderboard • /rank • /ranklist'
        },
        {
            name: '🛠️ Admin Commands',
            value:
            '/setvip • /resetcooldown • /setmoney\n' +
            '/addmoney • /removemoney • /addbank • /removebank\n' +
            '/jackpotdraw'
        },
        {
            name: 'ℹ️ Information',
            value: '/about'
        }
    )
    .setFooter({ text: 'CasinoEconomyBot — Help Menu' })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
