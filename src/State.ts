import {useEffect, useState, MouseEvent} from 'react';
import {History} from 'history';
import {MouseEventHandler} from 'react';
import matchPath from './url/matchPath';
import getArgs from './url/getArgs';
import {RouterConfig} from './RouterContext';
import generateUrlAndState from './url/generateUrlAndState';

export type Args = Record<string, any>;
export type RouteControls<T extends Args> = {
    /** Subcribe to changes to this route arg */
    useValue: () => T;
    link: (args: T) => {href: string; onClick: MouseEventHandler<any>};
    push: (args: T) => void;
    replace: (args: T) => void;
    args: {
        [K in keyof T]: {
            /** Subcribe to all changes to this route */
            useValue: () => T[K];
            link: (args: T[K]) => {href: string; onClick: MouseEventHandler<any>};
            push: (args: T[K]) => void;
            replace: (args: T[K]) => void;
        };
    };
};

export default class TroutyState<Config extends RouterConfig> {
    state: Record<string, Record<string, any>>;
    routes: {[K in keyof Config]: RouteControls<Config[K]['__type']>};
    config: Config;
    history: History;
    subs: Record<string, Record<string, Function[]>>;
    routeSubs: Function[];
    activeRoute: string | null;
    constructor(history: History, config: Config) {
        this.history = history;
        this.config = config;

        this.subs = {};
        this.routes = {} as any;
        this.state = {};
        this.activeRoute = null;
        this.routeSubs = [];

        //@todo subscribe to an existing history object

        for (const key in config) {
            const routeConfig = config[key];

            let args = {} as unknown as RouteControls<Config>['args'];
            for (const arg in routeConfig.parse) {
                args[arg as keyof RouteControls<Config>['args']] = {
                    useValue: () => this.useValue(key as string, arg as string),
                    push: this.makeUpdater('push', key, arg),
                    replace: this.makeUpdater('replace', key, arg),
                    link: this.makeStaticUpdater(key, arg)
                };
            }

            // Create route updaters
            this.routes[key] = {
                args,
                useValue: () => this.useValue(key as string, '*'),
                push: this.makeUpdater('push', key),
                replace: this.makeUpdater('replace', key),
                link: this.makeStaticUpdater(key)
            };

            // Check if this route is matching
            const params = matchPath(routeConfig.path, history.location.pathname);

            // Set state based on matched route
            this.state[key as string] = {};
            if (params) {
                this.activeRoute = key;

                this.state[key as string] = getArgs(routeConfig, {
                    location: history.location,
                    params
                });
            }
        }
    }

    next(next: any, arg?: string) {
        // @todo - figure out how to handle partial updates / cb functions
        //const previous = arg ? this.state[route][arg] : this.state[route];
        //const next = update instanceof Function ? update(previous) : update;
        return arg ? {[arg]: next} : next;
    }

    makeUpdater(method: 'push' | 'replace', routeKey: string, argKey?: string) {
        return (update: any) => {
            const next = this.next(update, argKey);
            this.transition(routeKey, next, method);
        };
    }

    // @todo - find out how push/replace is best handled
    // @todo - find out if target/modifier keys need to be handled
    makeStaticUpdater(routeKey: string, argKey?: string) {
        return (update: any) => {
            const next = this.next(update, argKey);
            const [href] = generateUrlAndState(this.config[routeKey])(next);
            return {
                href,
                onClick: (event: MouseEvent<any>) => {
                    if (
                        event.button === 0 // Ignore everything but left clicks
                        //(!target || target === '_self') && // Let browser handle "target=_blank" etc.
                        //!isModifiedEvent(event) // Ignore clicks with modifier keys
                    ) {
                        event.preventDefault();
                        // If the URL hasn't changed, a regular <a> will do a replace instead of
                        // a push, so do the same here.
                        //let replace = !!replaceProp || createPath(location) === createPath(path);
                        //navigate(to, {replace, state});
                        this.transition(routeKey, next, 'push');
                    }
                }
            };
        };
    }

    transition(route: string, nextState: any, method: 'push' | 'replace') {
        const currentArgs = this.state[route];
        if (this.activeRoute !== route) this.publish('*', '*', route);
        this.activeRoute = route;
        for (const key in nextState) {
            if (currentArgs[key] !== nextState[key]) {
                this.publish(route, key, nextState[key]);
            }
        }
        this.state[route] = {...this.state[route], ...nextState};
        this.publish(route, '*', this.state[route]);
        const next = generateUrlAndState(this.config[route])(this.state[route]);
        this.history[method](next[1]);
    }

    //
    // Subscriptions

    subscribe(route: string, arg: string, callback: (next: any) => void) {
        this.subs[route] ||= {};
        this.subs[route][arg] ||= [];
        this.subs[route][arg].push(callback);
        const index = this.subs[route][arg].length - 1;

        return () => {
            this.subs[route][arg].splice(index, 1);
        };
    }

    publish(route: string, arg: string, value: any) {
        this.subs[route]?.[arg]?.forEach((cb) => {
            cb(value);
        });
    }

    //
    // Hooks

    useValue(route: string, arg: string) {
        const [value, setValue] = useState(
            arg === '*' ? this.state[route] : this.state[route][arg]
        );
        useEffect(() => {
            return this.subscribe(route, arg, setValue);
        }, [route, arg]);
        return value;
    }

    /**
    Subscribe to updates in route changes.
    Used internally to dermine which route should render.
    */
    useActiveRoute() {
        const [value, setValue] = useState(this.activeRoute);
        useEffect(() => {
            return this.subscribe('*', '*', setValue);
        }, []);
        return value;
    }
}
