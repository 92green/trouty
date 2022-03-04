type Source = 'param' | 'query' | 'hash' | 'state';
type Kind = 'JSON' | 'URLON' | 'string' | 'number' | 'boolean' | 'transparent';

type ValidateUnknown<T> = (value: unknown) => T;

/** Provide validation for primitive values */
type Validate<T, U> = (value: T | undefined) => U;

export default class Parse<T> {
    source: Source;
    kind: Kind;
    validate: Validate<any, any> | ValidateUnknown<any>;
    _type: T;
    constructor(source: Source, kind: Kind, validate: Validate<any, any> | ValidateUnknown<any>) {
        this.source = source;
        this.kind = kind;
        this.validate = validate;

        // @ts-ignore
        this._type = null;
    }

    /** Get values out of the path params */
    static get param() {
        return {
            number: <F extends Validate<number, any>>(fn: F) =>
                new Parse<ReturnType<F>>('param', 'number', fn),
            string: <F extends Validate<string, any>>(fn: F) =>
                new Parse<ReturnType<F>>('param', 'string', fn),
            /** Can't think of a use case for this, but why not? */
            boolean: <F extends Validate<boolean, any>>(fn: F) =>
                new Parse<ReturnType<F>>('param', 'boolean', fn)
        };
    }

    /** Get values out of the query string */
    static get query() {
        return {
            number: <F extends Validate<number, any>>(fn: F) =>
                new Parse<ReturnType<F>>('query', 'number', fn),
            string: <F extends Validate<string, any>>(fn: F) =>
                new Parse<ReturnType<F>>('query', 'string', fn),
            boolean: <F extends Validate<boolean, any>>(fn: F) =>
                new Parse<ReturnType<F>>('query', 'boolean', fn),
            JSON: <F extends ValidateUnknown<any>>(fn: F) =>
                new Parse<ReturnType<F>>('query', 'JSON', fn),
            URLON: <F extends ValidateUnknown<any>>(fn: F) =>
                new Parse<ReturnType<F>>('query', 'URLON', fn)
        };
    }

    /** Get values from the hash. Note that there can only ever be one hash object */
    static get hash() {
        return {
            number: <F extends Validate<number, any>>(fn: F) =>
                new Parse<ReturnType<F>>('hash', 'number', fn),
            string: <F extends Validate<string, any>>(fn: F) =>
                new Parse<ReturnType<F>>('hash', 'string', fn),
            boolean: <F extends Validate<boolean, any>>(fn: F) =>
                new Parse<ReturnType<F>>('hash', 'boolean', fn),
            JSON: <F extends ValidateUnknown<any>>(fn: F) =>
                new Parse<ReturnType<F>>('hash', 'JSON', fn),
            URLON: <F extends ValidateUnknown<any>>(fn: F) =>
                new Parse<ReturnType<F>>('hash', 'URLON', fn)
        };
    }

    /** Get values from history state */
    static state<V>(fn: ValidateUnknown<V>) {
        return new Parse<V>('state', 'transparent', fn);
    }
}
