import Event from "../structures/Event";
import Client from "../structures/Client";
import { generateKeyPairSync } from 'node:crypto'

class Ready extends Event {
	constructor(client: Client) {
		super(client, { name: 'ready', once: true });
	}

	async run(): Promise<void> {
		this.client.logger.info('Online');

		const publicKeyDB = await this.client.db.get('client:encryption:public');
		const privateKeyDB = await this.client.db.get('client:encryption:private');

		if(!publicKeyDB || !privateKeyDB) {
			this.client.logger.warn('Generating Encryption Keys');

			const { privateKey, publicKey } = generateKeyPairSync('rsa', {
				modulusLength: 4096,
				publicKeyEncoding: {
					type: 'pkcs1',
					format: 'pem',
				},
				privateKeyEncoding: {
					type: 'pkcs1',
					format: 'pem',
					cipher: 'aes-256-cbc',
					passphrase: '',
				},
			})
			

			await this.client.db.set('client:encryption:public', publicKey);
			await this.client.db.set('client:encryption:private', privateKey);

			// @ts-expect-error global
			global.PUBLIC_ENCRYPTION_KEY = publicKey;
			// @ts-expect-error global
			global.PRIVATE_ENCRYPTION_KEY = privateKey;

			this.client.logger.warn('Encryption Keys Saved to DB - Please keep a copy of these keys safe')
		} else {
			// @ts-expect-error global
			global.PUBLIC_ENCRYPTION_KEY = publicKeyDB;
			// @ts-expect-error global
			global.PRIVATE_ENCRYPTION_KEY = privateKeyDB;
		}
	}
}

export = Ready;