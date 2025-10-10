import { exec } from 'child_process';

exec(`yarn sonar-scanner`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error running sonar-scanner: ${error}`);
    return;
  }

  console.log(`Output: ${stdout}`);
});
