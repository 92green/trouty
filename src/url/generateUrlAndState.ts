import {RouteConfig} from '../definitions';
import {generatePath} from 'react-router-dom';

export default function generateUrlAndState<T extends Record<string, any>>(config: RouteConfig<T>) {
    return (args: T): [string, Partial<T>] => {
        let hash = '';
        const queryData: Partial<Record<keyof T, string>> = {};
        const paramData: Partial<Record<keyof T, string>> = {};
        const state: Partial<T> = {};
        let key: keyof T;
        for (key in config.parse) {
            const parser = config.parse[key];
            const {validate} = parser;
            let outData = validate(args[key]);

            switch (parser.kind) {
                case 'boolean':
                case 'number':
                    outData = outData.toString();
                    break;

                case 'JSON':
                    const stringified = JSON.stringify(outData);
                    outData =
                        parser.source === 'hash' ? encodeURIComponent(stringified) : stringified;
                    break;
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
                    paramData[key] = outData;
                    break;
            }
        }
        const search = new URLSearchParams(queryData as Record<string, string>).toString();
        let url = generatePath(config.path, paramData);
        if (search) url += `?${search}`;
        if (hash) url += `#${hash}`;
        return [url, state];
    };
}
