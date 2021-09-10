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
            if (parser.type === 'query') queryData[key] = parser.out(args[key]);
            if (parser.type === 'state') state[key] = args[key];
            if (parser.type === 'hash') hash = parser.out(args[key]);
        }
        const search = new URLSearchParams(queryData as Record<string, string>).toString();
        if (search) url += `?${search}`;
        if (hash) url += `#${hash}`;
        return [url, state];
    };
}
