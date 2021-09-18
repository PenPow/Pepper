export enum CommandTypes {
    ADMIN = 'admin',
    INFO = 'info',
    FUN = 'fun',
    MISC = 'misc',
    MOD = 'mod',
    TAGS = 'tags'
}

export type Callback = <T>(t: T) => void