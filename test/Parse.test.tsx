import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import {Router, Switch, Route, createRouterContext, Parse} from '../src/index';
import {createMemoryHistory} from 'history';

function createRoute<T>(name: string, path: string, parse: any, to: any) {
    return Route<T>({
        path,
        parse,
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

const params = createRoute<{a: string}>(
    'params',
    '/params/:a/:b',
    {a: Parse.param, b: Parse.param},
    {a: 'bar', b: 'foo'}
);

const queryString = createRoute<{a: string}>(
    'queryString',
    '/queryString',
    {a: Parse.queryString, b: Parse.queryNumber, c: Parse.queryJSON},
    {a: 'bar', b: 5, c: ['zzz']}
);
const hashJson = createRoute<{a: string[]}>(
    'hashJson',
    '/hashJson',
    {a: Parse.hashJSON},
    {a: ['bar']}
);
const hashNumber = createRoute<{a: number}>(
    'hashNumber',
    '/hashNumber',
    {a: Parse.hashNumber},
    {a: 5}
);
const hashString = createRoute<{a: string}>(
    'hashString',
    '/hashString',
    {a: Parse.hashString},
    {a: 'bar'}
);

const required = createRoute<{a: string}>(
    'required',
    '/required',
    {
        required: Parse.queryString.required,
        requiredHash: Parse.hashString.required,
        param: Parse.param.required
    },
    {required: 'foo'}
);

const requiredState = createRoute<{a: string[]}>(
    'requiredState',
    '/requiredState',
    {
        a: Parse.state.required
    },
    {}
);

const defaults = createRoute<{a?: string; b?: string[]}>(
    'defaults',
    '/defaults',
    {
        a: Parse.queryString.default('foo'),
        b: Parse.state.default(['bar'])
    },
    {}
);

const state = createRoute<{a: string[]}>('state', '/state', {a: Parse.state}, {a: ['bar']});

const {RoutesProvider, useRoutes} = createRouterContext({
    defaults,
    hashJson,
    hashNumber,
    hashString,
    params,
    queryString,
    required,
    requiredState,
    state
});

function renderRoute(pathOrHistory: string) {
    return render(
        <Router history={createMemoryHistory({initialEntries: [pathOrHistory]})}>
            <RoutesProvider>
                <Switch>
                    {defaults.route}
                    {hashJson.route}
                    {hashNumber.route}
                    {hashString.route}
                    {params.route}
                    {queryString.route}
                    {required.route}
                    {requiredState.route}
                </Switch>
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

    it('will throw if default and required are set', () => {
        expect(() =>
            Route({
                path: '/',
                parse: {a: Parse.queryString.required.default('foo')},
                component: () => null
            })
        ).toThrow();
    });
});
