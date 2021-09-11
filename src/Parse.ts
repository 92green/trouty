const Parse = {
    Param: {type: 'param'},
    State: {type: 'state'},
    Query: {
        number: {type: 'query', in: parseInt, out: (x: number) => x.toString()},
        string: {type: 'query', in: (x: string): string => x, out: (x: string): string => x},
        json: {
            type: 'query',
            in: <T>(x: string): T => JSON.parse(x),
            out: <T>(x: T) => JSON.stringify(x)
        }
    },
    Hash: {
        number: {type: 'hash', in: parseInt, out: (x: number) => x.toString()},
        string: {type: 'hash', in: (x: string): string => x, out: (x: string): string => x},
        json: {
            type: 'hash',
            in: <T>(x: string): T => JSON.parse(decodeURIComponent(x)),
            out: <T>(x: T) => encodeURIComponent(JSON.stringify(x))
        }
    }
} as const;

export default Parse;
export const Param = Parse.Param;
export const State = Parse.State;
export const Query = Parse.Query;
export const Hash = Parse.Hash;
