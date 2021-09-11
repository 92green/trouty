import {History} from 'history';
import Parse from './Parse';
export type Out<T> = (outData: T) => string;
export type In<T> = (inData: string) => T;

export type RouteObject<T> = {
    _type: T;
    _actionCreator: (history: History) => RouteMethods<T>;
    route: React.ReactNode;
};

type RouteMethods<T> = {
    to: (args: T) => string;
    href: (args: T) => string;
    push: (args: T) => void;
    replace: (args: T) => void;
};

export type Routes<R extends Record<string, RouteObject<any>>> = {
    [K in keyof R]: RouteMethods<R[K]['_type']>;
};

export type RouteConfig<T> = {
    path: string;
    parse: {
        [K in keyof T]: Parse<T[K]>;
    };
    component: React.ComponentType<{args: T}>;
};
