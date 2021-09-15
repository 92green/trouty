import React from 'react';
import {Route as ReactRouterRoute, useLocation, useParams} from 'react-router-dom';
import generateUrlAndState from './url/generateUrlAndState';
import {RouteObject, RouteConfig} from './definitions';
import getArgs from './url/getArgs';
import {History} from 'history';

/**
The Route function is a wrapper around a component that describes what parts of the url are required by this component.
- config.path: The url you want to map to
- config.parse: a parsing object that matches your `args`
--- 
*/
export default function Route<Args>(config: RouteConfig<Args>): RouteObject<Args> {
    const {path, component: Component} = config;

    function RouteNode() {
        const params = useParams<Args>();
        const location = useLocation();
        const args = getArgs<Args>(config, {params, location});
        return <Component args={args} />;
    }

    const go = generateUrlAndState<Args>(config);

    return {
        route: (
            <ReactRouterRoute exact path={path} key={path}>
                <RouteNode />
            </ReactRouterRoute>
        ),
        // @ts-ignore - this is a dummy type to pass around for context
        _type: null,
        _actionCreator: (history: History) => ({
            to: (args: Args) => go(args)[0],
            href: (args: Args) => go(args)[0],
            push: (args: Args) => history.push(...go(args)),
            replace: (args: Args) => history.replace(...go(args))
        })
    };
}
