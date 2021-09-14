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

const a = Route<{a?: string; b: number}>({
    path: '/foo',
    parse: {
        a: Parse.queryString,
        b: Parse.queryNumber.optional.fallback(0)
    },
    component: () => {
        return null;
    }
});

const getArgs = () => JSON.parse(screen.getByTitle('value').textContent || '{}');

const params = createRoute<{a: string; b: string}>(
    'params',
    {path: '/params/:a/:b', parse: {a: Parse.param, b: Parse.param}},
    {a: 'bar', b: 'foo'}
);

const queryString = createRoute<{a: string; b: number; c: string[]}>(
    'queryString',
    {path: '/queryString', parse: {a: Parse.queryString, b: Parse.queryNumber, c: Parse.queryJSON}},
    {a: 'bar', b: 5, c: ['zzz']}
);
const hashJson = createRoute<{a: string[]}>(
    'hashJson',
    {path: '/hashJson', parse: {a: Parse.hashJSON}},
    {a: ['bar']}
);
const hashNumber = createRoute<{a: number}>(
    'hashNumber',
    {path: '/hashNumber', parse: {a: Parse.hashNumber}},
    {a: 5}
);
const hashString = createRoute<{a: string}>(
    'hashString',
    {path: '/hashString', parse: {a: Parse.hashString}},
    {a: 'bar'}
);

const optional = createRoute<{a?: string; b?: string; c?: string}>(
    'optional',
    {
        path: '/optional',
        parse: {
            a: Parse.queryString.optional.fallback('query'),
            b: Parse.hashString.optional.fallback('hash'),
            c: Parse.param.optional.fallback('param')
        }
    },
    {required: 'foo'}
);

const optionalState = createRoute<{a?: string[]}>(
    'optionalState',
    {
        path: '/optionalState',
        parse: {
            a: Parse.state.optional.fallback('state')
        }
    },
    {}
);

const state = createRoute<{a: string[]}>(
    'state',
    {path: '/state', parse: {a: Parse.state}},
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
        const history = createMemoryHistory({initialEntries: ['/state']});
        history.push('/state', {a: ['foo']});
        render(
            <Router history={history}>
                <RoutesProvider>{state.route}</RoutesProvider>
            </Router>
        );

        renderRoute('/state');
        const args = getArgs();
        expect(args.a).toEqual(['foo']);
        fireEvent.click(screen.getByTitle('link'));
        expect(history.location.state).toEqual({a: ['bar']});
    });
});

describe('modifiers', () => {
    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('will throw if required args are missing', () => {
        expect(() => renderRoute('/required')).toThrowError();
    });

    it('will throw if required state args are missing', () => {
        expect(() => renderRoute('/requiredState')).toThrowError(/a is required but was undefined/);
    });

    it('will not throw if other props are missing', () => {
        expect(() => renderRoute('/queryString')).not.toThrow();
        expect(() => renderRoute('/hashJson')).not.toThrow();
    });

    it('will set default value if missing', () => {
        renderRoute('/defaults');
        const args = getArgs();
        expect(args.a).toEqual('foo');
        expect(args.b).toEqual(['bar']);
        expect(screen.getByTitle('to').textContent).toBe('/defaults?a=foo');
    });
});
