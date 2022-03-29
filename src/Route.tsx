import {ComponentType, LazyExoticComponent} from 'react';
import Parse from './Parse';

export type RouteConfig<T> = {
    __type: T;
    path: string;
    component: ComponentType<any> | LazyExoticComponent<any>;
    parse: {
        [K in keyof T]-?: {} extends Pick<T, K> ? Parse<T[K] | undefined> : Parse<T[K]>;
    };
};

/**
The Route function is a wrapper around a component that describes what parts of the url are required by this component.
- config.path: The url you want to map to
- config.parse: a parsing object that matches your `args`
*/
export default function Route<T = Record<string, any>>(
    config: Omit<RouteConfig<T>, '__type'>
): RouteConfig<T> {
    const __type = null as unknown as T;
    return {...config, __type};
}
