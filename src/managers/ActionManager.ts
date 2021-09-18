/* eslint-disable @typescript-eslint/no-var-requires */
import { join, resolve } from "path";
import { readdir, readdirSync } from "node:fs";
import CacheManager from './CacheManager';
import type Client from '../structures/Client';
import { createClient } from "redis";
import type { RedisClientType } from "redis/dist/lib/client";
import type { RedisModules } from "redis/dist/lib/commands";
import type { RedisLuaScripts } from "redis/dist/lib/lua-script";
import { Callback } from "../types/ClientTypes";

class ActionManager {
    // initCommands(client: Client): void {
    //     //@ts-expect-error Globals are Not Recommended, but needed in this case
    //     readdirSync(join(global.__basedir, 'src/interactions')).filter(f => !f.endsWith('.js')).forEach(dir => {
    //         //@ts-expect-error Globals are Not Recommended, but needed in this case
	// 		const commands = readdirSync(resolve(join(join(global.__basedir, 'src/interactions'), dir))).filter(f => f.endsWith('js'))
	// 		commands.forEach(f => {
    //             //@ts-expect-error Globals are Not Recommended, but needed in this case
	// 			const Command = require(resolve(join(join(global.__basedir, 'src/interactions'), dir, f)))
	// 			const command = new Command(client)
	// 			if(command.name && !command.disabled) {
	// 				client.commands.set(command.name, command);
	// 			}
	// 		});
	// 	});
    // }

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

	initRedis(): RedisClientType<RedisModules, RedisLuaScripts>  {
		return createClient({ socket: { url: process.env.DATABASE_URL, password: process.env.DATABASE_PASSWORD }});
	}

	pubSub(callback: Callback): void {
		try {
			const expired = () => {
				const sub = createClient({ socket: { url: process.env.DATABASE_URL, password: process.env.DATABASE_PASSWORD }});
				sub.subscribe('__keyevent@0__:expired', () => {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					sub.on('message', (_: any, message: unknown) => {
						callback(message);
					});
				});
			};

			const pub = createClient({ socket: { url: process.env.DATABASE_URL, password: process.env.DATABASE_PASSWORD }});
			pub.send_command('config', ['set', 'notify-keyspace-events', 'Ex'], expired());
		}
		catch {
			process.exit(1);
		}
	}
}

export default ActionManager;