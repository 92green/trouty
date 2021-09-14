import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import {Router, Switch, Route, createRouterContext, Parse} from '../index';
import {createMemoryHistory, History} from 'history';

const foo = Route<{id: string; search: string}>({
    path: '/foo/:id',
    parse: {
        id: Parse.param.string.optional(),
        search: Parse.query.string.optional()
    },
    component: function Foo(props) {
        const routes = useRoutes();
        console.log(props);
        return (
            <div>
                <div title="name">Foo Route</div>
                <div title="id">{props.args.id}</div>
                <div title="search">{props.args.search}</div>
                <div title="to">{routes.bar.to({id: '456', search: 'purple'})}</div>
                <div title="href">{routes.bar.href({id: '456', search: 'purple'})}</div>
                <a title="push" onClick={() => routes.bar.push({id: 'a', search: 'b'})} />
                <a title="replace" onClick={() => routes.bar.replace({id: 'a', search: 'b'})} />
            </div>
        );
    }
});

const bar = Route<{id: string; search: string}>({
    path: '/bar/:id',
    parse: {
        id: Parse.param.string.optional(),
        search: Parse.query.string.optional()
    },
    component: function Bar() {
        return <div>Bar Route</div>;
    }
});

const {RoutesProvider, useRoutes} = createRouterContext({
    foo,
    bar
});

function renderRoute(pathOrHistory: string | History) {
    return render(
        <Router
            history={
                typeof pathOrHistory === 'string'
                    ? createMemoryHistory({initialEntries: [pathOrHistory]})
                    : pathOrHistory
            }
        >
            <RoutesProvider>
                <Switch>
                    {foo.route}
                    {bar.route}
                </Switch>
            </RoutesProvider>
        </Router>
    );
}

describe('args', () => {
    it('passes args to the component', () => {
        renderRoute('/foo/123?search=baz');
        expect(screen.getByTitle('name').textContent).toBe('Foo Route');
        expect(screen.getByTitle('id').textContent).toBe('123');
        expect(screen.getByTitle('search').textContent).toBe('baz');
    });

    it.todo('throws if an arg is missing');
    it.todo('applies default parameters');
});

describe('navigation', () => {
    it('returns the next route from to and href', () => {
        renderRoute('/foo/123?search=orange');
        expect(screen.getByTitle('to').textContent).toBe('/bar/456?search=purple');
        expect(screen.getByTitle('href').textContent).toBe('/bar/456?search=purple');
    });
    it('will push state', () => {
        const history = createMemoryHistory({initialEntries: ['/foo/123']});
        renderRoute(history);
        fireEvent.click(screen.getByTitle('push'));
        expect(history.location.pathname).toBe('/bar/a');
        expect(history.location.search).toBe('?search=b');
        expect(history.index).toBe(1);
    });

    it('will replace state', () => {
        const history = createMemoryHistory({initialEntries: ['/foo/123']});
        renderRoute(history);
        fireEvent.click(screen.getByTitle('replace'));
        expect(history.location.pathname).toBe('/bar/a');
        expect(history.location.search).toBe('?search=b');
        expect(history.index).toBe(0);
    });
});

describe('errors', () => {
    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    it('will throw if useContext is used outside of a provider', () => {
        function BadComponent() {
            useRoutes();
            return null;
        }
        expect(() => render(<BadComponent />)).toThrowError('RouterContext used before it exists');
    });
});
