import {ComponentType, LazyExoticComponent} from 'react';
import {History} from 'history';
import {LinkProps} from 'react-router-dom';
import Parse from './Parse';
export type Out<T> = (outData: T) => string;
export type In<T> = (inData: string) => T;

export type RouteObject<T> = {
    _type: T;
    _actionCreator: (history: History) => RouteMethods<T> | EmptyRouteMethods;
    route: React.ReactNode;
};

export type RouteMethods<T> = {
    // This is not great, becuase state is actually a subset of T not Partial<T>
    // Also the union is just some react-router type narrrowing we have to conform to
    to: (args: T) => LinkProps<Partial<T>>['to'];
    href: (args: T) => string;
    push: (args: T) => void;
    replace: (args: T) => void;
    args: T | null;
};
export type EmptyRouteMethods = {
    to: () => string;
    href: () => string;
    push: () => void;
    replace: () => void;
};

export type Routes<R extends Record<string, RouteObject<any>> = {}> = {
    [K in keyof R]: R[K]['_type'] extends undefined
        ? EmptyRouteMethods
        : RouteMethods<R[K]['_type']>;
};

export type LazyRouteConfig<T> = {
    path: string;
    component: LazyExoticComponent<ComponentType<{args: T}>>;
    parse: {
        [K in keyof T]-?: {} extends Pick<T, K> ? Parse<T[K] | undefined> : Parse<T[K]>;
    };
};

export type StandardRouteConfig<T> = {
    path: string;
    component: ComponentType<{args: T}>;
    parse: {
        [K in keyof T]-?: {} extends Pick<T, K> ? Parse<T[K] | undefined> : Parse<T[K]>;
    };
};

export type BoringRouteConfig = {
    path: string;
    component: ComponentType<any> | LazyExoticComponent<any>;
};

export type RouteConfig<T> = LazyRouteConfig<T> | StandardRouteConfig<T>;
