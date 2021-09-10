import React, {createContext, useContext} from 'react';
import {
    Route as ReactRouterRoute,
    useHistory,
    generatePath,
    useLocation,
    useParams
} from 'react-router-dom';

//
// Configs

type History = ReturnType<typeof useHistory>;

type Out<T> = (outData: T) => string;
type In<T> = (inData: string) => T;

type RouteObject<T> = {
    _type: T;
    _actionCreator: (history: History) => RouteMethods<T>;
    route: React.ComponentType<{args: T}>;
};

type RouteMethods<T> = {
    to: (args: T) => string;
    href: (args: T) => string;
    push: (args: T) => void;
    replace: (args: T) => void;
};

type Routes<R extends Record<string, RouteObject<any>>> = {
    [K in keyof R]: RouteMethods<R[K]['_type']>;
};

type Param = {type: 'param'};
type Query<V> = {type: 'query'; in: In<V>; out: Out<V>};
type Hash<V> = {type: 'hash'; in: In<V>; out: Out<V>};
type State = {type: 'state'};

type Parser<T> = Param | Query<T> | Hash<T> | State;

type RouteConfig<T> = {
    path: string;
    parse: {
        [K in keyof T]: Parser<T[K]>;
    };
    component: React.ComponentType<{args: T}>;
};

function getArgs<T extends Record<string, any>>(
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

function generateUrlAndState<T extends Record<string, any>>(config: RouteConfig<any>) {
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

export function Route<T>(config: RouteConfig<T>): RouteObject<T> {
    const {path, component: Component} = config;

    function route() {
        const params = useParams<T>();
        const location = useLocation();
        const args = getArgs<T>(config, {params, location});
        return (
            <ReactRouterRoute path={path} exact>
                <Component args={args} />
            </ReactRouterRoute>
        );
    }

    const go = generateUrlAndState<T>(config);

    return {
        route,
        // @ts-ignore - this is a dummy type to pass around for context
        _type: null,
        _actionCreator: (history: History) => ({
            to: (args) => go(args)[0],
            href: (args) => go(args)[0],
            push: (args: T) => history.push(...go(args)),
            replace: (args: T) => history.replace(...go(args))
        })
    };
}

export function createRouterContext<R extends Record<string, RouteObject<any>>>() {
    const RoutesContext = createContext<Routes<R> | undefined>(undefined);

    function RoutesProvider(props: {value: R; children: any}) {
        const history = useHistory();
        let routes = {} as unknown as Routes<R>;
        let key: keyof Routes<R>;
        for (key in props.value) {
            routes[key] = props.value[key]._actionCreator(history);
        }
        return <RoutesContext.Provider value={routes}>{props.children}</RoutesContext.Provider>;
    }

    function useRoutes(): Routes<R> {
        const routes = useContext(RoutesContext);
        if (!routes) throw new Error('RouterContext used before it exists');
        return routes;
    }

    return {useRoutes, RoutesProvider};
}

//
// Context

export const {Param, Hash, Query} = {
    Param: {type: 'param'},
    Query: {
        number: {type: 'query', in: parseInt, out: (x: number) => x.toString()},
        string: {type: 'query', in: (x: string): string => x, out: (x: string): string => x},
        json: {type: 'query', in: JSON.parse, out: JSON.stringify}
    },
    Hash: {
        number: {type: 'hash', in: parseInt, out: (x: number) => x.toString()},
        string: {type: 'hash', in: (x: string): string => x, out: (x: string): string => x},
        json: {type: 'hash', in: JSON.parse, out: JSON.stringify}
    }
} as const;

//import {Route, Hash, Param, Query, Link} from 'trouty';

//const a = Route<{foo: number}>({
//path: '/user/:id',
//parse: {},
//component: function UserItem(props) {
//const routes = useRoutes();
//return <Link to={routes.b.to({})}> Go to b</Link>;
//}
//});

//const b = Route<{bar: string}>({
//path: '/user/:id',
//parse: {},
//component: function UserItem(props) {
//const routes = useRoutes();
//return <Link to={routes.a.to({})}> Go to a</Link>;
//}
//});

//// probably in another file
//const {RoutesProvider, useRoutes} = createRouterContext({
//a,
//b
//});
