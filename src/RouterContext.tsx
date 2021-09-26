import React, {createContext, useContext} from 'react';
import {useHistory} from 'react-router-dom';
import {RouteObject, Routes} from './definitions';

/**
Once your routes are defined you can bring them together in a route context. This context is the namespace that defines what routes are allowed to be transitioned to.

@returns `RoutesProvider`, a `useRoutes` access hook for your components, and a `routes` object of components for you to render in a `<Switch />`.
*/
export default function createRouterContext<R extends Record<string, RouteObject<any>>>(routes: R) {
    const RoutesContext = createContext<Routes<R> | undefined>(undefined);

    const routeComponents = {} as unknown as Record<keyof R, React.ReactNode>;
    let key: keyof Routes<R>;
    for (key in routes) {
        routeComponents[key] = routes[key].route;
    }

    function RoutesProvider(props: {children: any}) {
        const history = useHistory();
        let value = {} as unknown as Routes<R>;
        let key: keyof Routes<R>;
        for (key in routes) {
            // @ts-ignore - got no idea how to type this and it doesn't appear to effect anything
            value[key] = routes[key]._actionCreator(history);
        }
        return <RoutesContext.Provider value={value}>{props.children}</RoutesContext.Provider>;
    }

    function useRoutes(): Routes<R> {
        const routes = useContext(RoutesContext);
        if (!routes) throw new Error('RouterContext used before it exists');
        return routes;
    }

    return {useRoutes, RoutesProvider, routes: routeComponents};
}
