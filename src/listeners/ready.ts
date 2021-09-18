import Event from "../structures/Event";
import Client from "../structures/Client";

class Ready extends Event {
	constructor(client: Client) {
		super(client, { name: 'ready', once: true });
	}

	async run(): Promise<void> {
		this.client.logger.info('Online');
	}
}

export = Ready;