import Base from "./Base";
import Client from "./Client";

class Event extends Base {
    public readonly name: string;
    public readonly once: boolean;

    constructor(client: Client, options: Record<string, any>) {
        super(client);

        this.name = options.name;
        this.once = options.once;
    }

    run(...args: unknown[]): void {
        throw new Error(`${this.name} has no run function`);
    }
}