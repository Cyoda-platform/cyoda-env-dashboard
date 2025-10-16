import figlet from 'figlet';
import chalk from 'chalk';

/**
 * Display CLI banner on startup
 */
export default function hookInit() {
  console.log(chalk.green(figlet.textSync('Cyoda UI CLI')));
}

