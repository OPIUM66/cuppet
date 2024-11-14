import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const runCommand = async (command, directory) => {
  try {
    const { stdout, stderr } = await execAsync(command, { cwd: directory });
    // console.log(`Output for ${directory}:\n${stdout}`);
    if (stderr) console.warn(`Warning for ${directory}:\n${stderr}`);
  } catch (error) {
    console.error(`💢 Error installing in ${directory}:`, error);
    throw error;
  }
};

const installDependencies = async () => {
  try {
    console.log("🔰 Installing dependencies in server/");
    await runCommand('npm install', './server');

    console.log("🔰 Installing dependencies in chat/");
    await runCommand('npm install', './chat');

    console.log("🔰 Installing tools in cuppet/");
    await runCommand('npm install', './cuppet');

    console.log("🆗 All dependencies installed.");
  } catch (error) {
    console.error("💢 Installation failed:", error);
  }
};

installDependencies();
