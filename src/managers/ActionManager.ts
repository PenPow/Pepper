import { join, resolve } from "path";
import { readdir, readdirSync } from "node:fs";
import CacheManager from './CacheManager';
import HTTPManager from "./HTTPManager";
import Client from "../structures/Client";

class ActionManager {
    initCommands(client: Client): void {
        //@ts-expect-error
        readdirSync(join(global.__basedir, 'src/commands')).filter(f => !f.endsWith('.js')).forEach(dir => {
            //@ts-expect-error
			const commands = readdirSync(resolve(join(join(global.__basedir, 'src/commands'), dir))).filter(f => f.endsWith('js'))
			commands.forEach(f => {
                //@ts-expect-error
				const Command = require(resolve(join(join(global.__basedir, 'src/commands'), dir, f)))
				const command = new Command(client)
				if(command.name && !command.disabled) {
					client.commands.set(command.name, command);
				}
			});
		});
    }

    initEvents(client: Client): void {
        //@ts-expect-error
		readdir(join(global.__basedir, 'src/events'), (err, files) => {
			if (err) client.logger.error(err);

			files.forEach(evt => {
				const Event = require(join(
                    //@ts-expect-error
					global.__basedir,
					'src/events/',
					evt,
				));

				const event = new Event(client);
				const eventName = evt.split('.')[0];

				client.on(
					eventName,
					(...args) => event.run(args),
				);
			});
		});
	}

    initCache(): CacheManager {
		return new CacheManager();
	}

    initExpress(client: Client): HTTPManager {
		const manager = new HTTPManager(client);
		manager.init();
        return manager;
    }
}

export default ActionManager;