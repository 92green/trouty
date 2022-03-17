import React, {createContext, useContext, useState, useEffect} from 'react';
import matchPath from './url/matchPath';
import {History, createBrowserHistory} from 'history';
import {RouteObject, Routes} from './definitions';
import getArgs from './url/getArgs';
import generateUrlAndState from './url/generateUrlAndState';

class TroutyState<Config extends Record<string, RouteObject<any>>> {
    state: Record<string, Record<string, any>>;
    routes: Routes<Config>;
    config: Config;
    history: History;
    subs: Record<string, Record<string, Function[]>>;
    routeSubs: Function[];
    activeRoute: string | null;
    constructor(history: History, config: Config) {
        this.history = history;
        this.config = config;

        this.subs = {};
        this.routes = {} as Routes<Config>;
        this.state = {};
        this.activeRoute = null;
        this.routeSubs = [];

        //@todo subscribe to an existing history object

        for (const key in config) {
            const routeConfig = config[key];
            
            // Create route updaters
            this.routes[key] = {
                args: {}, // Important for the next step
                useValue: () => this.useValue(key, '*'),
                push: this.makeUpdater('push', key),
                replace: this.makeUpdater('replace', key),
                to: this.makeStaticUpdater(key),
                href: this.makeStaticUpdater(key)
            };

            // Create arg updaters
            for (const arg in routeConfig.parse) {
                this.routes[key].args[arg] = {
                    useValue: () => this.useValue(key, arg),
                    push: this.makeUpdater('push', key, arg),
                    replace: this.makeUpdater('replace', key, arg),
                    to: this.makeStaticUpdater(key, arg),
                    href: this.makeStaticUpdater(key, arg)
                };
            }

            // Check if this route is matching
            const match = matchPath(
                routeConfig.path,
                history.location.pathname, 
            );

            // Set state based on matched route
            this.state[key] = {};
            if (match) {
                this.activeRoute = key;

                this.state[key] = getArgs(routeConfig, {
                    location: history.location,
                    params: match?.params
                });
            }

        }
    }

    next(next, route: string, arg?: string) {
        // @todo - figure out how to handle partial updates
        //const previous = arg ? this.state[route][arg] : this.state[route];
        //const next = update instanceof Function ? update(previous) : update;
        return arg ? {[arg]: next} : next;
    }

    makeUpdater(method: 'push' | 'replace', routeKey: string, argKey?: string) {
        return (update) => {
            const next = this.next(update, routeKey, argKey);
            this.transition(routeKey, next, method);
        };
    }

    // @todo - clean this up
    makeStaticUpdater(routeKey: string, argKey?: string) {
        return (update, method: 'push' | 'replace' = 'push') => {
            const next = this.next(update, routeKey, argKey);
            const [href] = this.generateLocation(routeKey, next);
            return {
                href,
                onClick: (event) => {
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
                    this.transition(routeKey, next, method);
                    }
                }
            };
        };
    }

    updateFromLocation(location) {
        for (const key in this.config) {
            const match = matchPath(
                path: this.config[key].path,
                location.pathname,
            );
            if (match) {
                const args = getArgs(this.config[key], {
                    location,
                    params: match.params
                });
                this.state[key] = args;
                break;
            }
        }
    }

    generateLocation(route, nextState) {
        return generateUrlAndState(this.config[route])(nextState);
    }

    // @todo - lock down types
    transition(route: string, nextState: any, method: 'push' | 'replace') {
        console.log(route, this.state)
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
        const next = this.generateLocation(route, this.state[route]);
        const payload = next[1];
        this.history[method](payload);
        return next[0];
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
        this.subs[route]?.[arg]?.forEach((cb) => cb(value));
    }


    //
    // Hooks
    //

    /**
    Subcribe to a route or route arg. When this value changes the hook will force a rerender
    Pass '*' to arg to subscribe to a whole route.
    */
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

/**
Once your routes are defined you can bring them together in a route context. This context is the namespace that defines what routes are allowed to be transitioned to.

@returns `RoutesProvider`, a `useRoutes` access hook for your components, and a `routes` object of components for you to render in a `<Switch />`.
*/
export default function createRouterContext<R extends Record<string, RouteObject<any>>>(routes: R) {
    // Set up contexts
    const RoutesContext = createContext<TroutyState<R> | undefined>(undefined);
    const history = createBrowserHistory();

    function RoutesProvider(props: {children: any}) {
        const [state] = useState(() => new TroutyState(history, routes));
        useEffect(() => {
            return state.unsubscribe;
        }, []);
        return <RoutesContext.Provider value={state}>{props.children}</RoutesContext.Provider>;
    }

    function useRouterState(): TroutyState<R> {
        const state = useContext(RoutesContext);
        if (!state) throw new Error('RouterContext used before it exists');
        return state;
    }

    function useRoutes(): Routes<R> {
        const state = useRouterState();
        return state.routes;
    }

    function Route({route, children}: {route: string; children: any}) {
        const router = useRouterState();
        const activeRoute = router.useActiveRoute();
        return activeRoute === route ? children : null;
    }

    // Create routes object
    const routeComponents = Object.keys(routes).reduce((rr, key: keyof R) => {
        const Component = routes[key].component;
        rr[key] = (
            <Route route={key}>
                <Component />
            </Route>
        );
        return rr;
    }, {} as Record<keyof R, React.ReactNode>);

    return {useRoutes, RoutesProvider, routes: routeComponents};
}
