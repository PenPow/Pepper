/* eslint-disable @typescript-eslint/no-var-requires */
import { join, resolve } from "path";
import { readdir, readdirSync } from "node:fs";
import CacheManager from './CacheManager';
import type Client from '../structures/Client';
import Redis from "ioredis";
import type Event from "../structures/Event";
import Command from "../structures/Command";
import Interaction from "../structures/Interaction";

class ActionManager {
    async initCommands(client: Client): Promise<void> {
        //@ts-expect-error Globals are Not Recommended, but needed in this case
        readdirSync(join(global.__basedir, 'src/applications')).filter(f => !f.endsWith('.js')).forEach(async (dir) => {
            //@ts-expect-error Globals are Not Recommended, but needed in this case
			const commands = readdirSync(resolve(join(global.__basedir, 'src/applications'), dir)).filter(f => f.endsWith('js'))
			commands.forEach(async (f) => {
                //@ts-expect-error Globals are Not Recommended, but needed in this case
				const Command = require(resolve(join(global.__basedir, 'src/applications', dir, f))).default;
				const command: Command = new Command(client)
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

				const event: Event = new Event(client);
				const eventName = event.name;

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

	initRedis(client: Client): Redis.Redis  {
		this.pubSub(client)
		return new Redis(process.env.DATABASE_URL)
	}

	initInteractions(client: Client): void {
		//@ts-expect-error Globals are Not Recommended, but needed in this case
		readdir(join(global.__basedir, 'src/interactions'), (err, files) => {
			if (err) client.logger.error(err);

			files.forEach(itr => {
				const Interaction = require(join(
                    //@ts-expect-error Globals are Not Recommended, but needed in this case
					global.__basedir,
					'src/interactions/',
					itr,
				));

				const interaction: Interaction = new Interaction(client);
				const interactionCustomId = interaction.name;

				client.commands.set(interactionCustomId, interaction)
			});
		});
	}

	pubSub(client: Client): void {
		try {
			const sub = new Redis(process.env.DATABASE_URL)
			sub.subscribe('__keyevent@0__:expired', () => {
				sub.on('message', (channel: string, message: string) => {
					client.emit('KEY_EXPIRE', message);
				})
			})

			const pub = new Redis(process.env.DATABASE_URL)
			pub.send_command('config', ['set', 'notify-keyspace-events', 'Ex'])
		} catch {
			throw new Error('Failed to Connect to Redis')
		}
	}
}

export default ActionManager;