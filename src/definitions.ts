import {History} from 'history';
import Parse from './Parse';
export type Out<T> = (outData: T) => string;
export type In<T> = (inData: string) => T;

export type RouteObject<T> = {
    _type: T;
    _actionCreator: (history: History) => RouteMethods<T>;
    route: React.ReactNode;
};

type RouteMethods<T> = {
    to: (args: T) => string;
    href: (args: T) => string;
    push: (args: T) => void;
    replace: (args: T) => void;
};

export type Routes<R extends Record<string, RouteObject<any>>> = {
    [K in keyof R]: RouteMethods<R[K]['_type']>;
};

export type RouteConfig<T extends Record<string, any>> = {
    /** 
    The url for this route, follows react-router conventions.
    @link https://reactrouter.com/web/api/Route/path-string-string
    */
    path: string;

    /** 
    An object that matches the shape of the routes args, where each key defines a parser. 
    @example
    ```ts
    import {Route, Parse} from 'trouty';

    export const UserItem = Route<{id: string, page: number, filter: string[]}>({
        path: '/user/:id',
        parse: {
            id: Parse.param.string,
            page: Parse.query.string,
            filter: Parse.query.json
        },
        component: () => {}
    });
    ```
    */
    parse: {
        [K in keyof T]-?: {} extends Pick<T, K> ? Parse<T[K] | undefined> : Parse<T[K]>;
    };

    /** The component to render when the path matches */
    component: React.ComponentType<{args: T}>;
};
