import {RouteConfig} from '../definitions';

export default function getArgs<T extends Record<string, any>>(
    config: RouteConfig<T>,
    data: {params: T; location: any}
): T {
    const {parse} = config;
    let args = {} as unknown as T;
    const searchParams = new URLSearchParams(data.location.search);

    let key: keyof T;
    for (key in parse) {
        const parser = parse[key];

        switch (parser.type) {
            case 'query':
                args[key] = parser.in(searchParams.get(key) || '');
                break;

            case 'param': {
                args[key] = data.params[key];
                break;
            }

            case 'hash':
                args[key] = parser.in(data.location.hash);
                break;

            case 'state':
                args[key] = data.location.state[key];
                break;
            default:
                throw new Error(`Parser for ${key} not found`);
        }
    }

    return args;
}
