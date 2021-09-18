import { Logger } from "tslog";
import { Client as DiscordClient, ClientOptions, Collection } from "discord.js";
import { CommandTypes } from '../types/ClientTypes';
import Command from "./Command";
import * as utils from '../utils/export';
import CacheManager from "../managers/CacheManager";
import ActionManager from "../managers/ActionManager";
import { createClient } from "redis";
import type { RedisClientType } from "redis/dist/lib/client";
import type { RedisModules } from "redis/dist/lib/commands";
import type { RedisLuaScripts } from "redis/dist/lib/lua-script";

export default class Client extends DiscordClient {
    public readonly logger: Logger;
    public readonly types: typeof CommandTypes;
    public readonly commands: Collection<string, Command>;
    public readonly utils: typeof import('../utils/export');
    private readonly actionManager: ActionManager;
    public readonly db: RedisClientType<RedisModules, RedisLuaScripts>
    public readonly cache: CacheManager;

    constructor(options: ClientOptions) {
        super(options);

        this.logger = new Logger({ name: "signal" });

        this.db = createClient({ socket: { url: process.env.DATABASE_URL }});

        this.types = CommandTypes;

        this.commands = new Collection();

        this.utils = utils;

        this.actionManager = new ActionManager();

        this.cache = this.actionManager.initCache();
    }

    async init(): Promise<void> {
        if(this.utils.isDocker()) {
            this.logger.warn('Running on Docker - Waiting 60 seconds to allow Redis to start');

            await this.utils.sleep(1000 * 60);
        }

        this.logger.info('Initalizing...');
        
        try {
            // this.actionManager.initCommands(this);
            this.actionManager.initEvents(this);

            await this.login(process.env.DISCORD_TOKEN)
        }
        catch(e) {
            this.logger.error(`Failed to Init: ${e.stack}`);
        }
    }
}