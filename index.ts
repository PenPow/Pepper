/**
 * Pepper
 *
 * Copyright (c) 2021 Joshua Clements
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @name @PenPow/Pepper
 * @copyright 2021 Joshua Clements
 * @license MIT
 */
process.title = 'Pepper';

//@ts-expect-error Globals are Not Recommended, but needed in this case
global.__basedir = __dirname;

import Client from './src/structures/Client';
import { Intents } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const intents = new Intents();
intents.add(
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILD_MESSAGES,
);

const client = new Client({
	intents: intents,
	allowedMentions: { repliedUser: false },
	failIfNotExists: true,
	presence: {
		status: 'online',
		activities: [{ name: 'to / commands', type: 'LISTENING' }],
	},
});

async function init() {
	await client.init();
}

init();

process.on('unhandledRejection', err => client.logger.error(err));