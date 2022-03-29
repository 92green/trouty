import React, {createContext, useContext, useState} from 'react';
import {createBrowserHistory} from 'history';
import TroutyState from './State';
import {RouteConfig} from './Route';

export type RouterConfig = Record<string, RouteConfig<any>>;
/**
Once your routes are defined you can bring them together in a route context. This context is the namespace that defines what routes are allowed to be transitioned to.

@returns `RoutesProvider`, a `useRoutes` access hook for your components, and a `routes` object of components for you to render in a `<Switch />`.
*/
export default function createRouterContext<R extends RouterConfig>(routes: R) {
    const RoutesContext = createContext<TroutyState<R> | undefined>(undefined);
    const history = createBrowserHistory();

    function RoutesProvider(props: {children: any}) {
        const [state] = useState(() => new TroutyState(history, routes));
        return <RoutesContext.Provider value={state}>{props.children}</RoutesContext.Provider>;
    }

    function useRouterState(): TroutyState<R> {
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
    let routeComponents = {} as unknown as Record<keyof R, React.ReactNode>;
    let key: keyof R;
    for (key in routes) {
        const Component = routes[key].component;
        routeComponents[key] = (
            <Route route={key}>
                <Component />
            </Route>
        );
    }

    return {useRoutes, RoutesProvider, routes: routeComponents};
}
