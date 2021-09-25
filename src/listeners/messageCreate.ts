import Event from "../structures/Event";
import Client from "../structures/Client";
import { Message } from "discord.js";
import fetch from "node-fetch"
import { PunishmentType } from "../types/ClientTypes";

class messageCreate extends Event {
	constructor(client: Client) {
		super(client, { name: 'messageCreate', once: false });
	}

	async run(args: [Message]): Promise<void> {
		const [message] = args;
		if(message.author.bot) return;

		const array = message.content.match(this.client.utils.URLRegex);

		if(array) {
			for(const URL of array) {
				if(this.client.cache.has(URL)) { 
					await message.delete(); 
					return;
				}
			}
				
			const body = {
				client: {
					clientId: 'pepper',
					clientVersion: '1.0.0'
				},
				threatInfo: {
					threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION", "THREAT_TYPE_UNSPECIFIED"],
					platformTypes: ["ANY_PLATFORM"],
					threatEntryTypes: ["URL"],
					threatEntries: array.map(u => Object.assign({}, { url: u }))
				}
			}

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_API_KEY}`, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }}).then((res: any): Promise<Record<string, unknown>> => res.json()).then(async (json: Record<string, unknown>) => { if(json.matches) this.client.utils.createCase({ guild: message.guild, caseNo: undefined, action: PunishmentType.BAN, actionExpiration: undefined, reason: 'Malicious URL Detected', moderator: { user: { tag: 'Pepper#7526'}, id: '883988074776899605'}, target: message.author, reference: undefined, channel: message.channel.id, assortedOptions: { deleteMessageDays: 7}}) })
		}
	}
}

export = messageCreate;