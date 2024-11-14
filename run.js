import { exec } from 'child_process';
import { spawn } from 'child_process';

const startProcessSilent = (command) => {
  exec(command, { }, (error, stdout, stderr) => {
    if (error) {
      console.error(`💢 Error starting in:`, error);
    } else {
    //   console.log(`Output for :\n${stdout}`);
      if (stderr) console.warn(`💢 Warning for :\n${stderr}`);
    }
  });
};

const startProcess = (command, args, label) => {
  const process = spawn(command, args, { stdio: 'inherit' });

  process.on('error', (error) => {
    console.error(`Error starting ${label}:`, error);
  });

  process.on('close', (code) => {
    console.log(`${label} exited with code ${code}`);
  });
};

const startApplications = () => {
  console.log("🔰 Starting server...");
  startProcess('node', ['./server/server.js'], 'Server');

  console.log("🔰 Starting dashboard application...");
  startProcessSilent('npm run chat');
};

startApplications();
