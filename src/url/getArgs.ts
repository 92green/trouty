import {RouteConfig} from '../definitions';
import {Location} from 'history';

export default function getArgs<T extends Record<string, any>>(
    config: RouteConfig<T>,
    data: {params: T; location: Location<any>}
): T {
    const {parse} = config;
    let args = {} as unknown as T;
    const searchParams = new URLSearchParams(data.location.search);

    let key: keyof T;
    for (key in parse) {
        const parser = parse[key];

        switch (parser._type) {
            case 'queryJSON':
            case 'queryNumber':
            case 'queryString':
                args[key] = parser.in(key, searchParams.get(key));
                break;

            case 'param': {
                args[key] = parser.in(key, data.params[key]);
                break;
            }

            case 'hashString':
            case 'hashNumber':
            case 'hashJSON':
                args[key] = parser.in(key, data.location.hash.slice(1));
                break;

            case 'state':
                args[key] = parser.in(key, data.location.state?.[key]);
                break;
        }
    }

    return args;
}
