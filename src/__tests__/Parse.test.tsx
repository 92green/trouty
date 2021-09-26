import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import {Router, Switch, Route, createRouterContext, Parse} from '../index';
import {RouteConfig} from '../definitions';
import {createMemoryHistory} from 'history';

function createRoute<T>(name: string, config: Omit<RouteConfig<T>, 'component'>, to: any) {
    return Route<T>({
        ...config,
        component: (props) => {
            const routes = useRoutes() as any;
            return (
                <div>
                    <div title="value">{JSON.stringify(props.args)}</div>
                    <div title="to">{routes[name].to(to)}</div>
                    <a title="link" onClick={() => routes[name].push(to)} />
                </div>
            );
        }
    });
}

const getArgs = () => JSON.parse(screen.getByTitle('value').textContent || '{}');

const params = createRoute<{a: string; b: string}>(
    'params',
    {
        path: '/params/:a/:b',
        parse: {a: Parse.param.string((x) => x || ''), b: Parse.param.string((x) => x || '')}
    },
    {a: 'bar', b: 'foo'}
);

const queryString = createRoute<{a: string; b: number; c: string[]}>(
    'queryString',
    {
        path: '/queryString',
        parse: {
            a: Parse.query.string((x) => x || ''),
            b: Parse.query.number((x) => x ?? 0),
            c: Parse.query.JSON((x) => (x || []) as string[])
        }
    },
    {a: 'bar', b: 5, c: ['zzz']}
);
const hashJson = createRoute<{a: string[]}>(
    'hashJson',
    {path: '/hashJson', parse: {a: Parse.hash.JSON((x) => (x || ['foo']) as string[])}},
    {a: ['bar']}
);
const hashNumber = createRoute<{a: number}>(
    'hashNumber',
    {path: '/hashNumber', parse: {a: Parse.hash.number((x) => x ?? 0)}},
    {a: 5}
);
const hashString = createRoute<{a: string}>(
    'hashString',
    {path: '/hashString', parse: {a: Parse.hash.string((x) => x || '')}},
    {a: 'bar'}
);

const optional = createRoute<{a?: string; b?: string; c?: string}>(
    'optional',
    {
        path: '/optional/:c?',
        parse: {
            a: Parse.query.string((x) => x || 'query'),
            b: Parse.hash.string((x) => x || 'hash'),
            c: Parse.param.string((x) => x || 'param')
        }
    },
    {}
);

const optionalState = createRoute<{a?: string[]}>(
    'optionalState',
    {
        path: '/optionalState',
        parse: {
            a: Parse.state((x) => (x || ['state']) as string[])
        }
    },
    {}
);

const state = createRoute<{a: string[]; b?: string}>(
    'state',
    {
        path: '/state',
        parse: {
            a: Parse.state((x) => (x ?? ['bar']) as string[]),
            b: Parse.state((x) => (typeof x === 'string' ? x : undefined))
        }
    },
    {a: ['bar']}
);

const {RoutesProvider, useRoutes, routes} = createRouterContext({
    hashJson,
    hashNumber,
    hashString,
    params,
    queryString,
    optional,
    optionalState,
    state
});

function renderRoute(pathOrHistory: string) {
    return render(
        <Router history={createMemoryHistory({initialEntries: [pathOrHistory]})}>
            <RoutesProvider>
                <Switch>{Object.values(routes)}</Switch>
            </RoutesProvider>
        </Router>
    );
}

describe('parsing', () => {
    it('parses the params', () => {
        renderRoute('/params/foo/bar');
        const args = getArgs();
        expect(args.a).toBe('foo');
        expect(args.b).toBe('bar');
        expect(screen.getByTitle('to').textContent).toBe('/params/bar/foo');
    });

    it('parses the queryString', () => {
        renderRoute('/queryString?a=foo&b=2&c=%5B%22foo%22%5D');
        const args = JSON.parse(screen.getByTitle('value').textContent || '{}');
        expect(args.a).toBe('foo');
        expect(args.b).toBe(2);
        expect(args.c).toEqual(['foo']);
        expect(screen.getByTitle('to').textContent).toBe(
            '/queryString?a=bar&b=5&c=%5B%22zzz%22%5D'
        );
    });

    it('parses the hash string', () => {
        renderRoute('/hashString#foo');
        const args = getArgs();
        expect(args.a).toBe('foo');
        expect(screen.getByTitle('to').textContent).toBe('/hashString#bar');
    });

    it('parses the hash number', () => {
        renderRoute('/hashNumber#2');
        const args = getArgs();
        expect(args.a).toBe(2);
        expect(screen.getByTitle('to').textContent).toBe('/hashNumber#5');
    });

    it('parses the hash json', () => {
        renderRoute('/hashJson#%5B%22foo%22%5D');
        const args = getArgs();
        expect(args.a).toEqual(['foo']);
        expect(screen.getByTitle('to').textContent).toBe('/hashJson#%5B%22bar%22%5D');
    });

    it('parses the state', () => {
        const history = createMemoryHistory({initialEntries: []});
        history.push('/state', {a: ['foo']});
        render(
            <Router history={history}>
                <RoutesProvider>{state.route}</RoutesProvider>
            </Router>
        );

        const args = getArgs();
        expect(args.a).toEqual(['foo']);
        fireEvent.click(screen.getByTitle('link'));
        expect(history.location.state).toEqual({a: ['bar']});
    });
});

//describe('modifiers', () => {
//beforeEach(() => {
//jest.spyOn(console, 'error').mockImplementation(() => {});
//});

//it('will throw if required args are missing', () => {
//expect(() => renderRoute('/queryString')).toThrowError();
//});

//it('return fallback if optional fallback is provided', () => {
//renderRoute('/optional');
//const args = getArgs();
//expect(args.a).toBe('query');
//expect(args.b).toBe('hash');
//expect(args.c).toBe('param');
//});

//it('return undefined for optional things', () => {
//const history = createMemoryHistory({initialEntries: ['/state']});
//render(
//<Router history={history}>
//<RoutesProvider>{state.route}</RoutesProvider>
//</Router>
//);

//const args = getArgs();
//expect(args.b).toBe(undefined);
//fireEvent.click(screen.getByTitle('link'));
//expect(history.location.state).toEqual({a: ['bar'], b: undefined});
//});

//it('will apply default args to next transition', () => {
//renderRoute('/optional');
//expect(screen.getByTitle('to').textContent).toBe('/optional/param?a=query#hash');
//});
//});
