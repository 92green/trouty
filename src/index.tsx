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
    _actionCreator: (history: History) => RouteActions<T>;
    route: React.ComponentType<{args: T}>;
};

type RouteActions<T> = {
    to: (args: T) => string;
    href: (args: T) => string;
    push: (args: T) => void;
    replace: (args: T) => void;
};

type Routes<T extends Record<string, RouteObject<any>>> = {
    [K in keyof T]: ReturnType<T[K]['_actionCreator']>;
};

type ArgsType = {
    params?: Record<string, any>;
    query?: Record<string, any>;
    hash?: Record<string, any>;
    state?: Record<string, any>;
};

type JoinArgs<T extends ArgsType> = T['params'] & T['query'] & T['hash'] & T['state'];

type RouteConfig<T extends ArgsType> = {
    path: string;
    query?: {
        [K in keyof T['query']]: [In<T['query'][K]>, Out<T['query'][K]>];
    };
    hash?: {
        [K in keyof T['hash']]: [In<T['hash'][K]>, Out<T['hash'][K]>];
    };
    state?: {
        [K in keyof T['state']]: [In<T['state'][K]>, Out<T['state'][K]>];
    };
    //hash: Partial<Record<keyof Args, [In,TOut]>>;
    component: React.ComponentType<{args: T['params'] & T['query'] & T['hash'] & T['state']}>;
};

function getArgs<T extends ArgsType>(
    config: RouteConfig<any>,
    data: {params: T['params']; location: any}
): JoinArgs<T> {
    let query: T['query'] = {};
    let hash: T['hash'] = {};
    let state: T['state'] = {};

    if (config.query) {
        const searchParams = new URLSearchParams(data.location.search);
        for (let [key, value] of Object.entries(query)) {
            query[key] = value[0](searchParams.get(key) || '');
        }
    }
    return {...data.params, ...query, ...hash, ...state};
}

function generateUrl<T extends ArgsType>(config: RouteConfig<any>) {
    return (args: JoinArgs<T>): string => {
        let url = generatePath(config.path, args);
        if (config.query) {
            const queryData: T['query'] = {};
            for (const key in config.query) {
                queryData[key] = config.query[key][1](args[key]);
            }
            const search = new URLSearchParams(queryData).toString();
            url += `?${search}`;
        }
        return url;
    };
}

function Route<T extends ArgsType>(config: RouteConfig<T>): RouteObject<JoinArgs<T>> {
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

    const to = generateUrl(config);

    return {
        route,
        _actionCreator: (history: History) => ({
            to,
            href: to,
            push: (args: JoinArgs<T>) => history.push(to(args)),
            replace: (args: JoinArgs<T>) => history.replace(to(args))
        })
    };
}

function createRouterContext<R extends Record<string, RouteObject<any>>>(routes: R) {
    const RoutesContext = createContext<Routes<R> | undefined>(undefined);

    function RoutesProvider(props: {value: R; children: any}) {
        const history = useHistory();
        let routes = ({} as unknown) as Routes<R>;
        for (const key in props.value) {
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

const userItem = Route<{
    params: {id: string};
    query: {search: number; foo: Array<string>};
    hash: {bar: string};
    state: {baz: string};
}>({
    path: '/user/:id',
    query: {
        search: [x => parseInt(x), x => x.toString()],
        foo: [x => JSON.parse(x), x => JSON.stringify(x)]
    },
    //hash: {search: [(x) => x, (x) => x]},
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
    routes.userItem.to({id: 'string', search: 2, foo: ['bar'], bar: 'baz', baz: 'asda'});
    return null;
}
