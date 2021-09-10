import React, {createContext, useContext} from 'react';
import {useHistory} from 'react-router-dom';
import {RouteObject, Routes} from './definitions';

export default function createRouterContext<R extends Record<string, RouteObject<any>>>() {
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
