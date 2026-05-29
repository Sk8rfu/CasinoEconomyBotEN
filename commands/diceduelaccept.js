import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('diceduelaccept')
.setDescription('Accept a Dice Duel challenge');

export async function execute(interaction) {
    const id = interaction.user.id;
    const duel = global.diceDuels[id];

    if (!duel) {
        return interaction.reply({ content: "❌ You have no active challenges.", flags: 64 });
    }

    const challenger = duel.challenger;
    const bet = duel.bet;

    const user1 = getUser(challenger);
    const user2 = getUser(id);

    if (user1.balance < bet || user2.balance < bet) {
        delete global.diceDuels[id];
        return interaction.reply({ content: "❌ One of the players does not have enough money.", flags: 64 });
    }

    const roll1 = Math.floor(Math.random() * 6) + 1;
    const roll2 = Math.floor(Math.random() * 6) + 1;

    let result = "";

    if (roll1 > roll2) {
        updateBalance(challenger, bet);
        updateBalance(id, -bet);
        result = `🎉 <@${challenger}> won and earned **€${bet}**!`;
    } else if (roll2 > roll1) {
        updateBalance(id, bet);
        updateBalance(challenger, -bet);
        result = `🎉 <@${id}> won and earned **€${bet}**!`;
    } else {
        result = "🤝 It's a tie! No win or loss.";
    }

    delete global.diceDuels[id];

    const embed = new EmbedBuilder()
    .setColor('#00A6FF')
    .setTitle('🎲 Dice Duel — Result')
    .addFields(
        { name: "Challenger's Roll", value: `${roll1}`, inline: true },
        { name: "Opponent's Roll", value: `${roll2}`, inline: true }
    )
    .setDescription(result)
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
