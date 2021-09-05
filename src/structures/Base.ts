import Client from "./Client";

export default abstract class Base {
    public readonly client: Client;
    constructor(client: Client) {
        this.client = client;
    }
}