import React, {createContext, useContext} from 'react';
import {useHistory} from 'react-router-dom';
import {RouteObject, Routes} from './definitions';

export default function createRouterContext<R extends Record<string, RouteObject<any>>>(routes: R) {
    const RoutesContext = createContext<Routes<R> | undefined>(undefined);

    function RoutesProvider(props: {children: any}) {
        const history = useHistory();
        let value = {} as unknown as Routes<R>;
        let key: keyof Routes<R>;
        for (key in routes) {
            value[key] = routes[key]._actionCreator(history);
        }
        return <RoutesContext.Provider value={value}>{props.children}</RoutesContext.Provider>;
    }

    function useRoutes(): Routes<R> {
        const routes = useContext(RoutesContext);
        if (!routes) throw new Error('RouterContext used before it exists');
        return routes;
    }

    return {useRoutes, RoutesProvider};
}
