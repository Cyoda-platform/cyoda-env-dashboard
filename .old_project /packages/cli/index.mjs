import {Command} from "commander";
import hookInit from "./hooks/hookInit.mjs";
import setup from "./commands/setup.mjs";
import {Logger} from "tslog";

const program = new Command();

program.hook('preAction', (thisCommand, actionCommand) => {
    hookInit()
})

program.addCommand(setup);

const log= new Logger();

void (async () => {
    try {
        await program.parseAsync(process.argv);
    } catch (e) {
        log.error(e);
        // console.log(e.message);
        process.exit();
    }
})();
