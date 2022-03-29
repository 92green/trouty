import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import {Router, Switch, Route, createRouterContext, Parse} from '../index';
import {RouteConfig} from '../Route';
import {createMemoryHistory} from 'history';

function renderRoute<T>(config: {
    initialPath: string;
    routeConfig: Omit<RouteConfig<T>, 'component'>;
    transitionObject?: T;
}) {
    const {initialPath, routeConfig, transitionObject} = config;
    const route = Route<T>({
        ...routeConfig,
        component: (props) => {
            const routes = useRoutes() as any;
            return (
                <div>
                    <div title="value">{JSON.stringify(props.args)}</div>
                    {transitionObject && (
                        <>
                            <div title="to">{routes.route.href(transitionObject)}</div>
                            <a title="link" onClick={() => routes.route.push(transitionObject)} />
                        </>
                    )}
                </div>
            );
        }
    });

    const {RoutesProvider, useRoutes, routes} = createRouterContext({route});
    const result = render(
        <Router history={createMemoryHistory({initialEntries: [initialPath]})}>
            <RoutesProvider>
                <Switch>{Object.values(routes)}</Switch>
            </RoutesProvider>
        </Router>
    );
    const args = JSON.parse(screen.getByTitle('value').textContent || '{}');
    return {args, result};
}

describe('string', () => {
    it('can parse strings', () => {
        const {args} = renderRoute<{param: string; query: string; hash: string}>({
            routeConfig: {
                path: '/strings/:param',
                parse: {
                    param: Parse.param.string((x) => x ?? ''),
                    query: Parse.query.string((x) => x ?? ''),
                    hash: Parse.hash.string((x) => x ?? '')
                }
            },
            initialPath: '/strings/a?query=b#c',
            transitionObject: {param: 'foo', query: 'bar', hash: 'baz'}
        });
        expect(args.param).toBe('a');
        expect(args.query).toBe('b');
        expect(args.hash).toBe('c');
        expect(screen.getByTitle('to').textContent).toBe('/strings/foo?query=bar#baz');
    });
    it('will pass undefined to validator if not found', () => {
        let query: any = '';
        let hash: any = '';
        const {args} = renderRoute<{query?: string; hash?: string}>({
            routeConfig: {
                path: '/strings',
                parse: {
                    query: Parse.query.string((x) => ((query = x), '')),
                    hash: Parse.hash.string((x) => ((hash = x), ''))
                }
            },
            initialPath: '/strings'
        });

        expect(query).toBeUndefined();
        expect(hash).toBeUndefined();
        expect(args).toEqual({query: '', hash: ''});
    });
});

describe('number', () => {
    it('can parse numbers', () => {
        const {args} = renderRoute<{param: number; query: number; hash: number}>({
            routeConfig: {
                path: '/numbers/:param',
                parse: {
                    param: Parse.param.number((x) => x ?? 0),
                    query: Parse.query.number((x) => x ?? 0),
                    hash: Parse.hash.number((x) => x ?? 0)
                }
            },
            initialPath: '/numbers/1?query=2#3',
            transitionObject: {param: 4, query: 5, hash: 6}
        });
        expect(args.param).toBe(1);
        expect(args.query).toBe(2);
        expect(args.hash).toBe(3);
        expect(screen.getByTitle('to').textContent).toBe('/numbers/4?query=5#6');
    });

    it('will pass undefined to validator if not found', () => {
        let query: any = '';
        let hash: any = '';
        const {args} = renderRoute<{query?: number; hash?: number}>({
            routeConfig: {
                path: '/numbers',
                parse: {
                    query: Parse.query.number((x) => ((query = x), 0)),
                    hash: Parse.hash.number((x) => ((hash = x), 0))
                }
            },
            initialPath: '/numbers'
        });

        expect(query).toBeUndefined();
        expect(hash).toBeUndefined();
        expect(args).toEqual({query: 0, hash: 0});
    });
});

describe('boolean', () => {
    it('can parse booleans', () => {
        const {args} = renderRoute<{param: boolean; query: boolean; hash: boolean}>({
            routeConfig: {
                path: '/booleans/:param',
                parse: {
                    param: Parse.param.boolean((x) => x ?? false),
                    query: Parse.query.boolean((x) => x ?? false),
                    hash: Parse.hash.boolean((x) => x ?? false)
                }
            },
            initialPath: '/booleans/true?query=false#true',
            transitionObject: {param: false, query: true, hash: false}
        });
        expect(args.param).toBe(true);
        expect(args.query).toBe(false);
        expect(args.hash).toBe(true);
        expect(screen.getByTitle('to').textContent).toBe('/booleans/false?query=true#false');
    });

    it('will pass undefined to validator if not found', () => {
        let query: any = '';
        let hash: any = '';
        const {args} = renderRoute<{query?: boolean; hash?: boolean}>({
            routeConfig: {
                path: '/booleans',
                parse: {
                    query: Parse.query.boolean((x) => ((query = x), false)),
                    hash: Parse.hash.boolean((x) => ((hash = x), false))
                }
            },
            initialPath: '/booleans'
        });

        expect(query).toBeUndefined();
        expect(hash).toBeUndefined();
        expect(args).toEqual({query: false, hash: false});
    });
});

describe('json', () => {
    it('can parse JSON', () => {
        const encodedFoo = '%5B%22foo%22%5D';
        const encodedBar = '%5B%22bar%22%5D';
        const {args} = renderRoute<{query: string[]; hash: string[]}>({
            routeConfig: {
                path: '/JSON',
                parse: {
                    query: Parse.query.JSON((x) => (Array.isArray(x) ? x : ['foo'])),
                    hash: Parse.hash.JSON((x) => (Array.isArray(x) ? x : ['foo']))
                }
            },
            initialPath: `/JSON?query=${encodedFoo}#${encodedFoo}`,
            transitionObject: {query: ['bar'], hash: ['bar']}
        });
        expect(args.query).toEqual(['foo']);
        expect(args.hash).toEqual(['foo']);
        expect(screen.getByTitle('to').textContent).toBe(`/JSON?query=${encodedBar}#${encodedBar}`);
    });

    it('will pass undefined to validator if not found', () => {
        let query: any = '';
        let hash: any = '';
        const {args} = renderRoute<{query?: string[]; hash?: string[]}>({
            routeConfig: {
                path: '/JSON',
                parse: {
                    query: Parse.query.JSON((x) => ((query = x), ['foo'])),
                    hash: Parse.hash.JSON((x) => ((hash = x), ['foo']))
                }
            },
            initialPath: '/JSON'
        });

        expect(query).toBeUndefined();
        expect(hash).toBeUndefined();
        expect(args).toEqual({query: ['foo'], hash: ['foo']});
    });
});

describe('state', () => {
    it('can parse state', () => {
        const {args} = renderRoute<{a: string[]; b: string}>({
            routeConfig: {
                path: '/state',
                parse: {
                    a: Parse.state((x) => (Array.isArray(x) ? x : ['blah'])),
                    b: Parse.state((x) => (typeof x === 'string' ? x : 'blah'))
                }
            },
            initialPath: `/state`,
            transitionObject: {a: ['foo'], b: 'foo'}
        });
        expect(args.a).toEqual(['blah']);
        expect(args.b).toBe('blah');
        expect(screen.getByTitle('to').textContent).toBe(`/state`);
    });
});

describe('errors', () => {
    it('wont add extra ? # if not present', () => {});
    it('will throw if param regex doesnt match the parse object', () => {});
    it('will throw if there are two hash parsers', () => {});
    it('errors in json will return undefined', () => {});
});
