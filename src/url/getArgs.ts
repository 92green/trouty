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

        let value;
        switch (parser.source) {
            case 'query':
                value = searchParams.get(key) || undefined;
                break;

            case 'param': {
                value = data.params[key];
                break;
            }

            case 'hash':
                value = data.location.hash.slice(1) || undefined;
                break;

            case 'state':
                value = data.location.state?.[key];
                break;
        }

        if (value === undefined) {
            if (parser._optional) {
                args[key] = parser._fallback || value;
            } else {
                throw new Error(
                    `${config.path} args.${key} is not optional but was undefined [${parser.source}:${parser.kind}]`
                );
            }
        } else {
            switch (parser.kind) {
                case 'number':
                    args[key] = Number(value) as any;
                    break;

                case 'JSON':
                    args[key] = JSON.parse(
                        parser.source === 'hash' ? decodeURIComponent(value) : value
                    );
                    break;

                case 'string':
                case 'transparent':
                    args[key] = value;
                    break;
            }
        }
    }

    return args;
}
