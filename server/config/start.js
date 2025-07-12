// startupMessage.js
import chalk from 'chalk';
import figlet from 'figlet';

export const displayStartupMessage = () => {
    figlet('Server in Command', (err, data) => {
        if (err) {
            console.error(chalk.red('Something went wrong...'));
            console.dir(err);
            return;
        }
        console.log(chalk.green(data));
        console.log(chalk.yellow('Server is starting...'));
    });
};
    