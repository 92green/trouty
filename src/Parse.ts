type Source = 'param' | 'query' | 'hash' | 'state';
type Kind = 'JSON' | 'string' | 'number' | 'boolean' | 'transparent';

export default class Parse<T> {
    _optional: boolean;
    _fallback?: T | undefined;
    source: Source;
    kind: Kind;
    constructor(source: Source, kind: Kind) {
        this.source = source;
        this.kind = kind;
        this._optional = false;
    }

    /** Get values out of the path params */
    static get param() {
        return {
            number: new Parse<number>('param', 'number'),
            string: new Parse<string>('param', 'string'),
            /** Can't think of a use case for this, but why not? */
            boolean: new Parse<any>('param', 'boolean'),
            /** This is technically possible but probably not sensible */
            JSON: new Parse<any>('param', 'JSON')
        };
    }

    /** Get values out of the query string */
    static get query() {
        return {
            number: new Parse<number>('query', 'number'),
            string: new Parse<string>('query', 'string'),
            boolean: new Parse<boolean>('query', 'boolean'),
            JSON: new Parse<any>('query', 'JSON')
        };
    }

    /** Get values from the hash. Note that there can only ever be one hash object */
    static get hash() {
        return {
            number: new Parse<number>('hash', 'number'),
            string: new Parse<string>('hash', 'string'),
            boolean: new Parse<boolean>('hash', 'boolean'),
            JSON: new Parse<any>('hash', 'JSON')
        };
    }

    /** Get values from history state */
    static get state() {
        return new Parse<any>('state', 'transparent');
    }

    optional<V extends T | undefined>(value?: V): Parse<T | V> {
        this._optional = true;
        this._fallback = value;
        return this;
    }
}
