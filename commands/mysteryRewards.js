export const mysteryRewards = [
    // 💰 Money (45% total chance)
    { type: "money", amount: 5000, chance: 15 },
{ type: "money", amount: 10000, chance: 12 },
{ type: "money", amount: 25000, chance: 10 },
{ type: "money", amount: 50000, chance: 8 },

// 👑 VIP rewards (10% total chance)
{ type: "vip", level: 1, chance: 2 },
{ type: "vip", level: 2, chance: 1 },

// 🎁 Standard items (20% total chance)
{ type: "item", id: "pvp_sword", chance: 5 },
{ type: "item", id: "pvp_shield", chance: 5 },
{ type: "item", id: "luck_small", chance: 4 },
{ type: "item", id: "luck_big", chance: 3 },
{ type: "item", id: "heal", chance: 2 },
{ type: "item", id: "energy", chance: 1 },

// 💳 Bank items (5% total chance)
{ type: "item", id: "bank_ticket", chance: 3 },
{ type: "item", id: "bank_card", chance: 2 },

// 🏆 Bulgarian Rare Items (15% total chance)
{ type: "item", id: "gold_trabant", chance: 3 },
{ type: "item", id: "tsar_crown", chance: 2 },
{ type: "item", id: "golden_lion", chance: 3 },
{ type: "item", id: "pliska_relic", chance: 2 },
{ type: "item", id: "kuker_mask", chance: 2 },
{ type: "item", id: "golden_lev", chance: 2 },
{ type: "item", id: "st_george_amulet", chance: 1 },

// 🚗 ULTRA RARE (1%)
{ type: "item", id: "sin_r1", chance: 1 },

// ❌ Empty box (9% chance)
{ type: "nothing", chance: 9 }
];
