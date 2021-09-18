import Event from "../structures/Event";
import Client from "../structures/Client";
import { Message } from "discord.js";
import fetch from "node-fetch"

class messageCreate extends Event {
	constructor(client: Client) {
		super(client, { name: 'messageCreate', once: false });
	}

  async run(args: [Message]): Promise<void> {
        const [ message ] = args;

        const array = message.content.match(this.client.utils.URLRegex);

        if(array !== null) {           
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
          fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_API_KEY}`, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }}).then((res: any): Promise<Record<string, unknown>> => res.json()).then((json: Record<string, unknown>) => { if(json.matches) message.delete() })
        }
	}
}

export = messageCreate;