export class Server implements Server {
    /** ID of server */
    id: number;
    /** Name of server */
    name: string;
    /** Whether this server is active */
    active: boolean;
    /** Discord ID linked to server */
    discord_id?: string;

    constructor(id: number, name: string,  active: boolean = true, discordId?: string) {
        this.id = id;
        this.name = name;
        this.active = active;
        this.discord_id = discordId;
    }
}