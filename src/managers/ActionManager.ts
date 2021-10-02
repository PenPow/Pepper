/* eslint-disable @typescript-eslint/no-var-requires */
import { join, resolve } from "path";
import { readdir, readdirSync } from "node:fs";
import CacheManager from './CacheManager';
import type Client from '../structures/Client';
import Redis from "ioredis";

class ActionManager {
    async initCommands(client: Client): Promise<void> {
        //@ts-expect-error Globals are Not Recommended, but needed in this case
        readdirSync(join(global.__basedir, 'src/interactions')).filter(f => !f.endsWith('.js')).forEach(async (dir) => {
            //@ts-expect-error Globals are Not Recommended, but needed in this case
			const commands = readdirSync(resolve(join(global.__basedir, 'src/interactions'), dir)).filter(f => f.endsWith('js'))
			commands.forEach(async (f) => {
                //@ts-expect-error Globals are Not Recommended, but needed in this case
				const Command = require(resolve(join(global.__basedir, 'src/interactions', dir, f))).default;
				const command = new Command(client)
				if(command) {
					client.commands.set(command.name, command);
				}
			});
		});
    }

    initEvents(client: Client): void {
        //@ts-expect-error Globals are Not Recommended, but needed in this case
		readdir(join(global.__basedir, 'src/listeners'), (err, files) => {
			if (err) client.logger.error(err);

			files.forEach(evt => {
				const Event = require(join(
                    //@ts-expect-error Globals are Not Recommended, but needed in this case
					global.__basedir,
					'src/listeners/',
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

	initRedis(): Redis.Redis  {
		return new Redis(process.env.DATABASE_URL)
	}
}

export default ActionManager;