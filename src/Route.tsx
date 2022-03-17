import {BoringRouteConfig, LazyRouteConfig, StandardRouteConfig} from './definitions';

/**
The Route function is a wrapper around a component that describes what parts of the url are required by this component.
- config.path: The url you want to map to
- config.parse: a parsing object that matches your `args`
*/
export function Route<T = Record<string, any>>(config: StandardRouteConfig<T>) {
    return config;
}

/**
LazyRoute is the same as Route but the component is from React.lazy. 
Because typescript sometimes struggles narrowing unions, it is easier to have an explicit export.
*/
export function LazyRoute<T = Record<string, any>>(config: LazyRouteConfig<T>) {
    return config;
}

/**
BoringRoute have no arguments so don't require any parsers. Their component can be either lazy or normal.
*/
export function BoringRoute(config: BoringRouteConfig) {
    return config;
}
