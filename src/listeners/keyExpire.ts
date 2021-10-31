import Event from "../structures/Event";
import Client from "../structures/Client";

class KeyExpire extends Event {
	constructor(client: Client) {
		super(client, { name: 'KEY_EXPIRE', once: false });
	}

	async run(args: [string]): Promise<void> {
		const [message] = args;

        console.log(message)
	}
}

export = KeyExpire;