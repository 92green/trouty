import {RouteConfig} from '../definitions';
import {generatePath} from 'react-router-dom';
import {createPath, LocationDescriptorObject} from 'history';
import urlon from 'urlon';

export default function generateUrlAndState<T extends Record<string, any>>(config: RouteConfig<T>) {
    return (args: T): [string, LocationDescriptorObject] => {
        const queryData: Partial<Record<keyof T, string>> = {};
        const paramData: Partial<Record<keyof T, string>> = {};
        const state: Partial<T> = {};
        let hashValue = '';
        let key: keyof T;
        for (key in config.parse) {
            const parser = config.parse[key];
            const {validate} = parser;
            let outData = validate(args[key]);

            if (outData !== undefined) {
                switch (parser.kind) {
                    case 'boolean':
                    case 'number':
                        outData = outData.toString();
                        break;

                    case 'URLON':
                    case 'JSON':
                        const stringify = parser.kind === 'JSON' ? JSON.stringify : urlon.stringify;
                        outData =
                            parser.source === 'hash'
                                ? encodeURIComponent(stringify(outData))
                                : stringify(outData);
                        break;
                }
                switch (parser.source) {
                    case 'query':
                        queryData[key] = outData;
                        break;

                    case 'hash':
                        hashValue = outData;
                        break;

                    case 'state':
                        state[key] = outData;
                        break;

                    case 'param':
                        paramData[key] = outData;
                        break;
                }
            }
        }

        const searchValue = new URLSearchParams(queryData as Record<string, string>).toString();
        const nextLocation: LocationDescriptorObject = {
            pathname: generatePath(config.path, paramData),
            hash: hashValue ? `#${hashValue}` : '',
            search: searchValue ? `?${searchValue}` : '',
            state
        };

        return [createPath(nextLocation), nextLocation];
    };
}
