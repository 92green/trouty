export default {
    Param: {type: 'param'},
    Query: {
        number: {type: 'query', in: parseInt, out: (x: number) => x.toString()},
        string: {type: 'query', in: (x: string): string => x, out: (x: string): string => x},
        json: {type: 'query', in: JSON.parse, out: JSON.stringify}
    },
    Hash: {
        number: {type: 'hash', in: parseInt, out: (x: number) => x.toString()},
        string: {type: 'hash', in: (x: string): string => x, out: (x: string): string => x},
        json: {type: 'hash', in: JSON.parse, out: JSON.stringify}
    }
} as const;
