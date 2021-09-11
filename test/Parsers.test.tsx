import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import {Router, Switch, Route, createRouterContext, Param, Query, Hash} from '../src/index';
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
                </div>
            );
        }
    });
}
const getArgs = () => JSON.parse(screen.getByTitle('value').textContent || '{}');

const params = createRoute<{a: string}>(
    'params',
    '/params/:a/:b',
    {a: Param, b: Param},
    {a: 'bar', b: 'foo'}
);

const queryString = createRoute<{a: string}>(
    'queryString',
    '/queryString',
    {a: Query.string, b: Query.number, c: Query.json},
    {a: 'bar', b: 5, c: ['zzz']}
);
const hashJson = createRoute<{a: string[]}>('hashJson', '/hashJson', {a: Hash.json}, {a: ['bar']});
const hashNumber = createRoute<{a: number}>('hashNumber', '/hashNumber', {a: Hash.number}, {a: 5});
const hashString = createRoute<{a: string}>(
    'hashString',
    '/hashString',
    {a: Hash.string},
    {a: 'bar'}
);

const {RoutesProvider, useRoutes} = createRouterContext({
    params,
    queryString,
    hashString,
    hashNumber,
    hashJson
});

function renderRoute(pathOrHistory: string) {
    return render(
        <Router history={createMemoryHistory({initialEntries: [pathOrHistory]})}>
            <RoutesProvider>
                <Switch>
                    {params.route}
                    {queryString.route}
                    {hashString.route}
                    {hashNumber.route}
                    {hashJson.route}
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

    it('parses the the hash string', () => {
        renderRoute('/hashString#foo');
        const args = getArgs();
        expect(args.a).toBe('foo');
        expect(screen.getByTitle('to').textContent).toBe('/hashString#bar');
    });

    it('parses the the hash number', () => {
        renderRoute('/hashNumber#2');
        const args = getArgs();
        expect(args.a).toBe(2);
        expect(screen.getByTitle('to').textContent).toBe('/hashNumber#5');
    });

    it('parses the the hash json', () => {
        renderRoute('/hashJson#%5B%22foo%22%5D');
        const args = getArgs();
        expect(args.a).toEqual(['foo']);
        expect(screen.getByTitle('to').textContent).toBe('/hashJson#%5B%22bar%22%5D');
    });
});
