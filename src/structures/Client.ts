import { Logger } from "tslog";
import { Client as DiscordClient, ClientOptions, Collection } from "discord.js";
import { CommandType } from '../types/ClientTypes';
import Command from "./Command";
import * as utils from '../utils/export';
import CacheManager from "../managers/CacheManager";
import ActionManager from "../managers/ActionManager";
import Redis from "ioredis";

export default class Client extends DiscordClient {
    public readonly logger: Logger;
    public readonly types: typeof CommandType;
    public readonly commands: Collection<string, Command>;
    public readonly utils: typeof import('../utils/export');
    private readonly actionManager: ActionManager;
    public readonly db: Redis.Redis;
    public readonly cache: CacheManager;

    constructor(options: ClientOptions) {
        super(options);

        this.logger = new Logger({ name: "signal" });

        this.types = CommandType;

        this.commands = new Collection();

        this.utils = utils;

        this.actionManager = new ActionManager();

        this.db = this.actionManager.initRedis()

        this.cache = this.actionManager.initCache();
    }

    async init(): Promise<void> {
        if(this.utils.isDocker()) {
            this.logger.warn('Running on Docker - Waiting 60 seconds to allow Redis to start');

            await this.utils.sleep(1000 * 60);
        }

        this.logger.info('Initalizing...');
        
        try {
            await this.actionManager.initCommands(this);
            this.actionManager.initEvents(this);

            await this.login(process.env.DISCORD_TOKEN)
        }
        catch(e) {
            this.logger.error(`Failed to Init: ${e.stack}`);
        }
    }
}