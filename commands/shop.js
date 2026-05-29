import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const items = [

    // 🟨 VIP
    { id: "vip1", name: "VIP Level 1", price: 50000, desc: "Gives +10% bonus winnings.", category: "VIP" },
{ id: "vip2", name: "VIP Level 2", price: 150000, desc: "Gives +20% bonus winnings.", category: "VIP" },
{ id: "vip3", name: "VIP Level 3", price: 300000, desc: "Gives +30% bonus winnings.", category: "VIP" },

// 🟦 Boosts
{ id: "boost_slots", name: "Slots Boost", price: 8000, desc: "Increases winnings from /slots.", category: "Boosts" },
{ id: "boost_blackjack", name: "Blackjack Boost", price: 10000, desc: "Improves odds in /blackjack.", category: "Boosts" },
{ id: "boost_duel", name: "Duel Boost", price: 12000, desc: "Gives +20 strength in duels.", category: "Boosts" },

// 🍀 Luck
{ id: "luck_small", name: "Lucky Charm", price: 6000, desc: "Small luck bonus.", category: "Luck" },
{ id: "luck_big", name: "Golden Clover", price: 20000, desc: "Large luck bonus.", category: "Luck" },

// 🕵️ Crime
{ id: "crime_mask", name: "Crime Mask", price: 7000, desc: "Increases success chance in /crime.", category: "Crime" },
{ id: "rob_gloves", name: "Robbery Gloves", price: 9000, desc: "Increases success chance in /rob.", category: "Crime" },

// ⚔ PvP
{ id: "pvp_shield", name: "Duel Shield", price: 11000, desc: "Reduces damage in duels.", category: "PvP" },
{ id: "pvp_sword", name: "Duel Sword", price: 15000, desc: "Increases damage in duels.", category: "PvP" },

// 🧪 Consumables
{ id: "heal", name: "Healing Potion", price: 2000, desc: "Used with /use heal.", category: "Consumables" },
{ id: "energy", name: "Energy Drink", price: 1500, desc: "Reduces cooldown of /work.", category: "Consumables" },

// 💰 Economy
{ id: "bank_ticket", name: "Bank Ticket", price: 10000, desc: "Increases your bank limit.", category: "Economy" },
{ id: "loan_cut", name: "Loan Reducer", price: 8000, desc: "Reduces your loan by 10%.", category: "Economy" },

// 💳 Bank Cards
{ id: "bank_card", name: "Bank Card", price: 25000, desc: "Increases bank limit by +20%.", category: "Bank Cards" },
{ id: "bank_card_gold", name: "Bank Card GOLD", price: 50000, desc: "Increases bank limit by +10,000€.", category: "Bank Cards" },
{ id: "bank_card_platinum", name: "Bank Card PLATINUM", price: 120000, desc: "Increases bank limit by +25,000€.", category: "Bank Cards" },
{ id: "bank_card_diamond", name: "Bank Card DIAMOND", price: 250000, desc: "Increases bank limit by +50,000€.", category: "Bank Cards" },

// 💎 Rare Items
{ id: "phoenix", name: "Phoenix Feather", price: 50000, desc: "Prevents one loss.", category: "Rare Items" },
{ id: "diamond", name: "Diamond Token", price: 75000, desc: "A very rare item.", category: "Rare Items" },
{ id: "artifact", name: "Ancient Artifact", price: 100000, desc: "A mysterious item of great value.", category: "Rare Items" },

// 🇧🇬 Bulgarian Artifacts
{ id: "gold_trabant", name: "Golden Trabant", price: 250000, desc: "A unique Bulgarian collector’s car.", category: "Bulgarian Artifacts" },
{ id: "tsar_crown", name: "Crown of Tsar Simeon", price: 300000, desc: "A historical artifact from the First Bulgarian Empire.", category: "Bulgarian Artifacts" },
{ id: "golden_lion", name: "Golden Lion", price: 200000, desc: "Symbol of Bulgarian strength and independence.", category: "Bulgarian Artifacts" },
{ id: "pliska_relic", name: "Relic of Pliska", price: 180000, desc: "Artifact from the ancient capital Pliska.", category: "Bulgarian Artifacts" },
{ id: "kuker_mask", name: "Kuker Mask", price: 120000, desc: "Traditional Bulgarian mask used to ward off evil.", category: "Bulgarian Artifacts" },
{ id: "golden_lev", name: "Golden Lev", price: 220000, desc: "A pure gold collector coin.", category: "Bulgarian Artifacts" },
{ id: "st_george_amulet", name: "St. George Amulet", price: 160000, desc: "A powerful protective amulet.", category: "Bulgarian Artifacts" },

// 🚗 Vehicles
{ id: "sin_r1", name: "SIN R1", price: 1000000, desc: "Bulgarian supercar manufactured in Ruse.", category: "Vehicles" }
];

export const data = new SlashCommandBuilder()
.setName('shop')
.setDescription('Shows all available items in the shop');

export async function execute(interaction) {

    // Group by category
    const categories = {};
    for (const item of items) {
        if (!categories[item.category]) categories[item.category] = [];
        categories[item.category].push(item);
    }

    const embed = new EmbedBuilder()
    .setColor('#00A6FF')
    .setTitle('🛒 Shop — Available Items')
    .setDescription('Use `/buy <id>` to purchase an item.')
    .setFooter({ text: 'CasinoEconomyBot — Shop' })
    .setTimestamp();

    for (const category of Object.keys(categories)) {
        let text = "";
        for (const item of categories[category]) {
            text += `**${item.name}** — €${item.price}\n`;
            text += `📝 ${item.desc}\n`;
            text += `🆔 \`${item.id}\`\n\n`;
        }

        embed.addFields({
            name: `📦 ${category}`,
            value: text
        });
    }

    return interaction.reply({ embeds: [embed] });
}
