import Base from "./Base";
import Client from "./Client";

class Event extends Base {
    public readonly name: string;
    public readonly once: boolean;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(client: Client, options: Record<string, any>) {
        super(client);

        this.name = options.name;
        this.once = options.once;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run(...args: unknown[]): void {
        throw new Error(`${this.name} has no run function`);
    }
}

export default Event