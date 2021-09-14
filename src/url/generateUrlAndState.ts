import {RouteConfig} from '../definitions';
import {generatePath} from 'react-router-dom';

export default function generateUrlAndState<T extends Record<string, any>>(
    config: RouteConfig<any>
) {
    return (args: T): [string, Partial<T>] => {
        let url = generatePath(config.path, args);
        let hash = '';
        const queryData: Partial<Record<keyof T, string>> = {};
        const state: Partial<T> = {};
        let key: keyof T;
        for (key in config.parse) {
            const parser = config.parse[key];
            let outData;

            if (args[key] === undefined && parser._optional) {
                outData = parser._fallback || args[key];
            } else {
                switch (parser.kind) {
                    case 'number':
                        outData = args[key].toString();
                        break;

                    case 'JSON':
                        outData = JSON.stringify(
                            parser.source === 'hash' ? encodeURIComponent(args[key]) : args[key]
                        );
                        break;

                    case 'string':
                    case 'transparent':
                        outData = args[key];
                        break;
                }
            }

            switch (parser.source) {
                case 'query':
                    queryData[key] = outData;
                    break;

                case 'hash':
                    hash = outData;
                    break;

                case 'state':
                    state[key] = outData;
                    break;

                case 'param':
                    break;
            }
        }
        const search = new URLSearchParams(queryData as Record<string, string>).toString();
        if (search) url += `?${search}`;
        if (hash) url += `#${hash}`;
        return [url, state];
    };
}
