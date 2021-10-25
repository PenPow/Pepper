import { ButtonInteraction } from "discord.js";
import Base from "./Base";
import Client from "./Client";

class Interaction extends Base {
    public readonly name: string;

    constructor(client: Client, name: string) {
        super(client);

        this.name = name;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run(args: ButtonInteraction): void {
        throw new Error(`${this.name} has no run function`);
    }
}

export default Interaction