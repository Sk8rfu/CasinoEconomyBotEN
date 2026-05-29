import 'dotenv/config';
import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import fs from 'fs';
import path from 'path';

global.pendingDuels = {};

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// Load all commands from the /commands folder
const commandsPath = path.join(process.cwd(), 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(`file://${filePath}`);

    // ⏭ Skip files that are NOT commands (missing data)
    if (!command.data) {
        console.log(`⏭ Skipping file (not a command): ${file}`);
        continue;
    }

    client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, c => {
    console.log(`🤖 Bot is online as ${c.user.tag}`);

    const statuses = [
        "Play for big wins!",
        "Use /help for all commands",
        "Open a Mystery Box for rare items",
        "Collect SIN R1 — the rarest item!",
        "Become a millionaire with /work",
        "Sell items using /sell",
        "Check your profile with /profile",
        "Earn VIP levels from Mystery Boxes",
        "Collect rare Bulgarian items!",
        "The best economy bot!",
        "Powered by Bulgarian currency"
    ];

    let index = 0;

    setInterval(() => {
        c.user.setActivity(statuses[index], { type: 0 }); // Playing
        index = (index + 1) % statuses.length;
    }, 30000);
});

// --- Global cooldown table ---
const cooldowns = new Map();

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // --- Cooldown system for all commands ---
    const userId = interaction.user.id;
    const now = Date.now();
    const cooldownTime = 3000; // 3 seconds cooldown

    if (cooldowns.has(userId)) {
        const expiration = cooldowns.get(userId) + cooldownTime;

        if (now < expiration) {
            const remaining = ((expiration - now) / 1000).toFixed(1);
            return interaction.reply({
                content: `⏳ Please wait **${remaining}s** before using another command.`,
                flags: 64
            });
        }
    }

    cooldowns.set(userId, now);

    // --- Execute the command ---
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: '⚠️ An error occurred while executing this command.',
            flags: 64
        });
    }
});

client.login(process.env.DISCORD_TOKEN);
