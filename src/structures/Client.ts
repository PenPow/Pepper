import { Logger } from "tslog";
import { Client as DiscordClient, ClientOptions, Collection } from "discord.js";
import { CommandTypes } from '../types/ClientTypes';
import Command from "./Command";
import * as MiscUtils from '../utils/MiscUtils';

export default class Client extends DiscordClient {
    public readonly logger: Logger;
    public readonly types: CommandTypes;
    public readonly commands: Collection<string, Command>;
    public readonly utils: unknown;
    private readonly actionManager: ActionManager;
    public cache: CacheManager;
    public http: HTTPManager;

    constructor(options: ClientOptions) {
        super(options);

        this.logger = new Logger({ name: "signal" });
        this.types = {
            ADMIN: 'admin',
            FLIGHTS: 'flights',
            INFO: 'info',
            FUN: 'fun',
            MISC: 'misc',
            MOD: 'mod',
            TAGS: 'tags'
        }
        this.commands = new Collection();
        this.utils = MiscUtils;
        this.actionManager = new ActionManager();
    }

    async init(): Promise<void> {
        this.logger.info('Initalizing...');
        
        try {
            this.actionManager.init();

            await this.login(process.env.DISCORD_TOKEN)
        }
        catch(e) {
            this.logger.error(`Failed to Init: ${e.stack}`);
        }
    }
}