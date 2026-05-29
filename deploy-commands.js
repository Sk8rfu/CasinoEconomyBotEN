import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';

const commands = [];
const commandsPath = path.join(process.cwd(), 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(`file://${filePath}`);

    // ⏭️ If the file is NOT a command (missing data), skip it
    if (!command.data) {
        console.log(`⏭️ Skipping file (not a command): ${file}`);
        continue;
    }

    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
    console.log('🌍 Registering global slash commands...');
    await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
                   { body: commands }
    );
    console.log('✅ Global commands registered successfully.');
    console.log('⚠️ Note: Discord may take up to 1 hour to activate them.');
} catch (error) {
    console.error(error);
}
