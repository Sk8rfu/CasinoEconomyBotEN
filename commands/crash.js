import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('crash')
.setDescription('Play Crash — multiplier game')
.addIntegerOption(opt =>
opt.setName('bet')
.setDescription('How much you want to bet')
.setRequired(true)
)
.addNumberOption(opt =>
opt.setName('cashout')
.setDescription('At which multiplier to cash out (example: 2.5)')
.setRequired(true)
);

export async function execute(interaction) {
    const id = interaction.user.id;
    const bet = interaction.options.getInteger('bet');
    const cashout = interaction.options.getNumber('cashout');
    const user = getUser(id);

    if (bet <= 0) {
        return interaction.reply({
            content: "❌ The bet must be a positive number.",
            flags: 64
        });
    }

    if (cashout < 1.01) {
        return interaction.reply({
            content: "❌ Cashout multiplier must be at least **1.01x**.",
            flags: 64
        });
    }

    if (user.balance < bet) {
        return interaction.reply({
            content: "❌ You don’t have enough money for this bet.",
            flags: 64
        });
    }

    // Generate crash multiplier
    const crashPoint = generateCrashPoint();

    // VIP bonus
    const vipBonus = 1 + user.vip_level * 0.05;

    let win = 0;
    let resultText = "";

    if (cashout <= crashPoint) {
        win = Math.floor(bet * cashout * vipBonus);
        updateBalance(id, win - bet);
        resultText =
        `🎉 Success! Crash reached **${crashPoint.toFixed(2)}x**\n` +
        `You cashed out at **${cashout}x** and won **€${win}**!`;
    } else {
        updateBalance(id, -bet);
        resultText =
        `💥 Crash happened at **${crashPoint.toFixed(2)}x** before your cashout **(${cashout}x)**.\n` +
        `You lost **€${bet}**.`;
    }

    const embed = new EmbedBuilder()
    .setColor(win > 0 ? '#00FF00' : '#FF0000')
    .setTitle('🎲 Crash Game')
    .setDescription(resultText)
    .addFields(
        { name: "Bet", value: `€${bet}`, inline: true },
        { name: "Cashout", value: `${cashout}x`, inline: true },
        { name: "Crash Point", value: `${crashPoint.toFixed(2)}x`, inline: true }
    )
    .setFooter({ text: 'CasinoEconomyBot — Crash' })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}

// --- Crash formula ---
// Higher multiplier = lower chance
function generateCrashPoint() {
    const r = Math.random();
    return 1 / (1 - r); // classic crash formula
}
