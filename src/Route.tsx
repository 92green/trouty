import React from 'react';
import {Route as ReactRouterRoute, useHistory, useLocation, useParams} from 'react-router-dom';
import generateUrlAndState from './url/generateUrlAndState';
import {RouteObject, RouteConfig} from './definitions';
import getArgs from './url/getArgs';
import {History} from 'history';

export default function Route<T>(config: RouteConfig<T>): RouteObject<T> {
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
