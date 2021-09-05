
import cors from "cors";
import express from "express";
import Client from "../structures/Client";

class HTTPManager {
    protected client: Client;
    public app: express.Application;

    constructor(client: Client) {
        this.client = client;
        this.app = express();
    }

    init(): void {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({
          extended: true
        }));

        this.app.listen('8080', () => this.client.logger.info('Listening on Port 8080'));
    }
}

export default HTTPManager;