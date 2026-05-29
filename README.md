<p align="center">
  <img src="https://github.com/Sk8rfu/CasinoEconomyBotEN/blob/assets/banner.png?raw=true?raw=true">
</p>

# 🎰 CasinoEconomyBotEN
A powerful Discord economy bot featuring casino games, PvP duels, Mystery Box, loans, banking, VIP system, shop, inventory, and much more.
---

Currency - €

---

## 🚀 Features

### 💰 Economy
- /balance — view your balance

- /bank — banking operations

- /loan — take a loan

- /payloan — repay your loan

- /work — work for money

- /daily — daily reward

- /weekly — weekly reward

- /monthly — monthly reward

- /give — give money to another player

---

### 🛒 Shop & Inventory
- /shop — view the shop

- /buy — buy an item

- /sell — sell an item

- /inventory — view your inventory

- /use — use an item

- /trade — trade items

- /effects — view active effects

---

### 🎲 Gambling Games
- /slots • /slots10 • /slots50

- /blackjack

- /roulette

- /poker

- /coinflip

- /rps

- /yahtzee

- /crash

- /mines • /minesmulti

- /open • /cashout

- /cardflip

- /plinko

- /dicebot

- /baccarat

---

### ⚔ PvP Duel
- /duel

- /duelaccept

- /dueldeny

- /diceduel

- /diceduelaccept

- /dicedueldeny

---

### 🕵️ Crime
- /crime

- /rob

---

### 🎁 Mystery Box
- /mysterybox — open a reward box

---

### 🎡 Daily Spin
- /spin — spin the wheel of fortune (24h cooldown)

---

### 💰 Jackpot
- /jackpot — view participants

- /jackpotdraw — draw a winner (admin)

---

### 👑 VIP Commands
- /vip

- /vipdaily

- /vipweekly

- /vipmonthly

---

### 📊 Statistics
- /profile

- /leaderboard

- /rank

- /ranklist

---

### 🛠 Admin Commands
- /setvip

- /resetcooldown

- /setmoney

- /addmoney

- /removemoney

- /addbank

- /removebank

- /jackpotdraw

---

### 🧾 Information
- /about

---

## 📦 Installation

### 1️⃣ Clone the project
```bash
git clone https://github.com/Sk8rfu/CasinoEconomyBotEN.git
cd CasinoEconomyBot
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Create a .env file
```env
DISCORD_TOKEN=YOUR_BOT_TOKEN
CLIENT_ID=YOUR_CLIENT_ID
```

### 4️⃣ Register Slash commands
```bash
node deploy-commands.js
```

### 5️⃣ Start the bot
```bash
node index.js
```

---

## 🗄 Database

The bot uses **SQLite**.
The file `economy.db` is created automatically on first launch.

**Do NOT upload economy.db to GitHub.**

Add to `.gitignore`:

```
*.db
.env
node_modules/
```

---

## 📁 Project Structure

```
/commands
    balance.js
    profile.js
    shop.js
    use.js
    loan.js
    payloan.js
    mysterybox.js
    ...
/db.js
/index.js
/package.json
/README.md
```

---

## 🏆 License
Free to use and modify.

---

## ❤️ Support
If you have questions or suggestions — open an Issue on GitHub.
