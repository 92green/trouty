import React, {createContext, useContext, useState} from 'react';
import {createBrowserHistory, History} from 'history';
import TroutyState from './State';
import {RouteConfig} from './Route';

export type RouterConfig = Record<string, RouteConfig<any>>;
/**
Once your routes are defined you can bring them together in a route context. This context is the namespace that defines what routes are allowed to be transitioned to.

@returns `RoutesProvider`, a `useRoutes` access hook for your components, and a `routes` object of components for you to render in a `<Switch />`.
*/
export default function createRouterContext<T extends RouterConfig>(config: T) {
    const RoutesContext = createContext<TroutyState<T> | undefined>(undefined);

    function RoutesProvider(props: {children: any; history?: History}) {
        const [state] = useState(
            () => new TroutyState(props.history || createBrowserHistory(), config)
        );
        return <RoutesContext.Provider value={state}>{props.children}</RoutesContext.Provider>;
    }

    function useRouterState(): TroutyState<T> {
        const state = useContext(RoutesContext);
        if (!state) throw new Error('RouterContext used before it exists');
        return state;
    }

    function useRoutes() {
        const state = useRouterState();
        return state.routes;
    }

    function Route({route, children}: {route: string; children: any}) {
        const router = useRouterState();
        const activeRoute = router.useActiveRoute();
        return activeRoute === route ? children : null;
    }

    // Create routes object
    let routeComponents = {} as unknown as {[K in keyof T]: T[K]['component']};
    let routes = {} as unknown as Record<keyof T, React.ReactElement<any>>;
    for (const key in config) {
        const Component = config[key].component;
        routeComponents[key] = (props: any) => (
            <Route route={key}>
                <Component {...props} />
            </Route>
        );
        routes[key] = (
            <Route route={key}>
                <Component />
            </Route>
        );
    }

    return {useRoutes, RoutesProvider, routes, routeComponents};
}
