import React, {useMemo} from 'react';
import {Route as ReactRouterRoute, useLocation, useParams, matchPath} from 'react-router-dom';
import generateUrlAndState from './url/generateUrlAndState';
import {
    RouteObject,
    BoringRouteConfig,
    LazyRouteConfig,
    StandardRouteConfig,
    RouteMethods,
    EmptyRouteMethods
} from './definitions';
import getArgsFromLocation from './url/getArgs';
import compareLocations from './url/compareLocations';
import {History, LocationDescriptorObject} from 'history';

function createRouteObject<T>(
    config: StandardRouteConfig<T> | LazyRouteConfig<T>,
    RouteComponent: React.ComponentType<any>
): RouteObject<T> {
    const go = generateUrlAndState<T>(config);

    const safeTransition = (
        current: LocationDescriptorObject,
        next: LocationDescriptorObject,
        method: Function
    ) => {
        if (!compareLocations(current, next)) {
            method(next);
        }
    };

    return {
        route: (
            <ReactRouterRoute exact path={config.path} key={config.path}>
                <RouteComponent />
            </ReactRouterRoute>
        ),
        // @ts-ignore - this is a dummy type to pass around for context
        _type: null,
        _actionCreator: (history: History): RouteMethods<T> => {
            function getArgs() {
                const match = matchPath<T>(history.location.pathname, {
                    path: config.path,
                    exact: true
                });

                if (!match) return null;

                return getArgsFromLocation<T>(config, {
                    location: history.location,
                    params: match.params
                });
            }

            const wrapArgs = (argsOrFunction: T | ((next: T | null) => T)) => {
                if (argsOrFunction instanceof Function) {
                    return argsOrFunction(getArgs());
                }
                return argsOrFunction;
            };
            return {
                to: (next) => go(wrapArgs(next))[1],
                href: (next) => go(wrapArgs(next))[0],
                push: (next) => {
                    safeTransition(history.location, go(wrapArgs(next))[1], history.push);
                },
                replace: (next) => {
                    safeTransition(history.location, go(wrapArgs(next))[1], history.replace);
                },
                useArgs: () => {
                    const args = useMemo(() => getArgs(), [history.location.key]);
                    return args;
                }
            };
        }
    };
}

function createRouteComponent<T>(config: StandardRouteConfig<T> | LazyRouteConfig<T>) {
    return function RouteComponent() {
        const params = useParams<T>();
        const location = useLocation();
        const Component = config.component;
        return <Component args={getArgsFromLocation<T>(config, {params, location})} />;
    };
}
/**
The Route function is a wrapper around a component that describes what parts of the url are required by this component.
- config.path: The url you want to map to
- config.parse: a parsing object that matches your `args`
*/
export function Route<T = Record<string, any>>(config: StandardRouteConfig<T>): RouteObject<T> {
    return createRouteObject(config, createRouteComponent<T>(config));
}

/**
LazyRoute is the same as Route but the component is from React.lazy. 
Because typescript sometimes struggles narrowing unions, it is easier to have an explicit export.
*/
export function LazyRoute<T = Record<string, any>>(config: LazyRouteConfig<T>): RouteObject<T> {
    return createRouteObject(config, createRouteComponent<T>(config));
}

/**
BoringRoute have no arguments so don't require any parsers. Their component can be either lazy or normal.
*/
export function BoringRoute(config: BoringRouteConfig) {
    const {path, component: Component} = config;

    return {
        route: (
            <ReactRouterRoute exact path={path} key={path}>
                <Component />
            </ReactRouterRoute>
        ),
        _type: undefined,
        _actionCreator: (history: History): EmptyRouteMethods => ({
            to: () => path,
            href: () => path,
            push: () => history.push(path),
            replace: () => history.replace(path)
        })
    };
}
