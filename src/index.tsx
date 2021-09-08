import React, {createContext, useContext} from 'react';
import {
    Route as ReactRouterRoute,
    useHistory,
    generatePath,
    useLocation,
    useParams
} from 'react-router-dom';
import {Object} from 'ts-toolbelt';

//
// Configs

type History = ReturnType<typeof useHistory>;

type Out<T> = (outData: T) => string;
type In<T> = (inData: string) => T;

type RouteObject<T> = {
    _actionCreator: (
        history: History
    ) => {
        to: (args: T) => string;
        href: (args: T) => string;
        push: (args: T) => void;
        replace: (args: T) => void;
    };
    route: React.ComponentType<{args: T}>;
};

type Routes<T extends Record<string, RouteObject<any>>> = {
    [K in keyof T]: ReturnType<T[K]['_actionCreator']>;
};

//[In<T[K]>, Out<T[K]>];
type Param = {type: 'param'};
type Query<V> = {type: 'query'; in: In<V>; out: Out<V>};
type Hash<V> = {type: 'hash'; in: In<V>; out: Out<V>};
type State<V> = {type: 'state'; in: In<V>; out: Out<V>};

type RouteConfig<T> = {
    path: string;
    parse: {
        [K in keyof T]: Param | Query<T[K]> | Hash<T[K]> | State<T[K]>;
    };
    component: React.ComponentType<{args: T}>;
};

function getArgs<T extends Record<string, any>>(
    config: RouteConfig<T>,
    data: {params: T; location: any}
): T {
    let args = ({} as unknown) as T;

    if (config.query) {
        const searchParams = new URLSearchParams(data.location.search);
        let key: keyof T;
        for (key in config.query) {
            args[key] = config.query[key][0](searchParams.get(key) || '');
        }
    }
    return args;
}

function generateUrl<T>(config: RouteConfig<any>) {
    return (args: T): string => {
        let url = generatePath(config.path, args);
        if (config.query) {
            const queryData: T = {};
            for (const key in config.query) {
                queryData[key] = config.query[key][1](args[key]);
            }
            const search = new URLSearchParams(queryData).toString();
            url += `?${search}`;
        }
        return url;
    };
}

function Route<T>(config: RouteConfig<T>): RouteObject<T> {
    const {
        path,
        //hash,
        component: Component
    } = config;

    function route() {
        const params = useParams();
        const location = useLocation();
        const args = getArgs<T>(config, {params, location});
        return (
            <ReactRouterRoute path={path} exact>
                <Component args={args} />
            </ReactRouterRoute>
        );
    }

    const to = generateUrl<T>(config);

    return {
        route,
        _actionCreator: (history: History) => ({
            to,
            href: to,
            push: (args: T) => history.push(to(args)),
            replace: (args: T) => history.replace(to(args))
        })
    };
}

function createRouterContext<R extends Record<string, RouteObject<any>>>(routes: R) {
    const RoutesContext = createContext<Routes<R> | undefined>(undefined);

    function RoutesProvider(props: {value: R; children: any}) {
        const history = useHistory();
        let routes = ({} as unknown) as Routes<R>;
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

const {Param, Hash, Query} = {
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

const userItem = Route<{
    id: string;
    search: number;
    foo: string[];
    bar: number;
}>({
    path: '/user/:id',
    parse: {
        id: Param,
        search: Query.number,
        foo: Hash.json,
        bar: Hash.number
    },
    component: function UserItem(props) {
        const routes = useRoutes();
        props.args.id;
        return null;
    }
});

const {RoutesProvider, useRoutes} = createRouterContext({
    userItem
});

function Other() {
    const routes = useRoutes();
    routes.userItem.to();
    return null;
}
