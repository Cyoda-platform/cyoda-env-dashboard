import figlet from 'figlet';
// import standard from 'figlet/importable-fonts/Standard.js';
import chalk from 'chalk';

// figlet.parseFont('Standard');

export default function hookInit() {
    console.log(chalk.green(figlet.textSync('Cyoda UI CLI')))
}
