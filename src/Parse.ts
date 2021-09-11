import invariant from 'tiny-invariant';

type ParseType =
    | 'param'
    | 'queryString'
    | 'queryNumber'
    | 'queryJSON'
    | 'hashString'
    | 'hashNumber'
    | 'hashJSON'
    | 'state'
    | 'hash';

export default class Parse<T> {
    _type: ParseType;
    _default?: T;
    _required: boolean;

    constructor(type: ParseType) {
        this._type = type;
        this._required = false;
    }
    static get param() {
        return new Parse<string>('param');
    }
    static get queryString() {
        return new Parse<string>('queryString');
    }
    static get queryNumber() {
        return new Parse<number>('queryNumber');
    }
    static get queryJSON() {
        return new Parse<any>('queryJSON');
    }
    static get hashString() {
        return new Parse<string>('hashString');
    }
    static get hashNumber() {
        return new Parse<number>('hashNumber');
    }
    static get hashJSON() {
        return new Parse<any>('hashJSON');
    }
    static get state() {
        return new Parse<any>('state');
    }

    get required() {
        this._required = true;
        return this;
    }

    default(value: T) {
        invariant(!this._required, 'A parser cannot be required and have a default value');
        this._default = value;
        return this;
    }

    in(key: string, x: any) {
        const missingError = new Error(`${key} is required but was ${x}`);
        // Handle State first as it's the only non-stringy type
        if (this._type === 'state') {
            if (x === undefined) {
                if (this._required) throw missingError;
                return this._default;
            }
            return x;
        }

        if (x === '') {
            if (this._required) throw missingError;
            if (this._default) return this._default;
        }
        switch (this._type) {
            case 'queryNumber':
            case 'hashNumber':
                return Number(x);

            case 'queryJSON':
                return JSON.parse(x || '{}');

            case 'hashJSON':
                return JSON.parse(decodeURIComponent(x) || '{}');

            default:
                return x;
        }
    }

    out(x: any) {
        if (x == null && this._default) return this._default;
        switch (this._type) {
            case 'queryNumber':
            case 'hashNumber':
                return x.toString();

            case 'queryJSON':
                return JSON.stringify(x);

            case 'hashJSON':
                return encodeURIComponent(JSON.stringify(x));

            default:
                return x;
        }
    }
}
