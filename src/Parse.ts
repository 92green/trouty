type ParseType =
    | 'param'
    | 'queryString'
    | 'queryNumber'
    | 'queryBoolean'
    | 'queryJSON'
    | 'hashString'
    | 'hashNumber'
    | 'hashBoolean'
    | 'hashJSON'
    | 'state'
    | 'hash';

export default class Parse<T> {
    _type: ParseType;
    _fallback?: T;
    _optional: boolean;

    constructor(type: ParseType) {
        this._type = type;
        this._optional = false;
    }
    static get param() {
        return new ParseString('param');
    }
    static get queryString() {
        return new ParseString('queryString');
    }
    static get queryNumber() {
        return new ParseNumber('queryNumber');
    }
    static get queryBoolean() {
        return new ParseBoolean('queryBoolean');
    }
    static get queryJSON() {
        return new ParseJSON('queryJSON');
    }
    static get hashString() {
        return new ParseString('hashString');
    }
    static get hashNumber() {
        return new ParseNumber('hashNumber');
    }
    static get hashBoolean() {
        return new ParseBoolean('hashBoolean');
    }
    static get hashJSON() {
        return new ParseJSON('hashJSON');
    }
    static get state() {
        return new ParseState('state');
    }

    get optional(): Parse<T | undefined> {
        this._optional = true;
        return this;
    }

    fallback(fallback: NonNullable<T>) {
        this._fallback = fallback;
        return this as unknown as Parse<NonNullable<T>>;
    }

    getFallback(key: string, x: any) {
        if (x === undefined) {
            if (this._optional) return this._fallback ?? x;
            throw new Error(`${key} is required but was ${x}`);
        }
        return x;
    }
}

class ParseNumber extends Parse<number> {
    in(key: string, x: string | undefined): number | undefined {
        this.getFallback(key, x);
        return Number(x);
    }
    out(x: number): string {
        return x.toString();
    }
}

class ParseString extends Parse<string> {
    in(key: string, x: string): string {
        this.getFallback(key, x);
        return x;
    }
    out(x: string): string {
        return x;
    }
}

class ParseBoolean extends Parse<boolean> {
    in(key: string, x: string): boolean | undefined {
        this.getFallback(key, x);
        return Boolean(x);
    }
    out(x: boolean): string {
        return x.toString();
    }
}
class ParseJSON extends Parse<any> {
    in(key: string, x: string): any {
        this.getFallback(key, x);
        return JSON.parse(decodeURIComponent(x) || '{}');
    }
    out(x: any): string {
        if (x === undefined && this._fallback) return this._fallback;
        if (this._type === 'hashJSON') return encodeURIComponent(JSON.stringify(x));
        return JSON.stringify(x);
    }
}

class ParseState extends Parse<any> {
    in(key: string, x: any): any {
        this.getFallback(key, x);
        return x;
    }
    out(x: any): any {
        if (x === undefined && this._fallback) return this._fallback;
        return x;
    }
}
