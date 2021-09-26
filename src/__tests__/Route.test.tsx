import React, {Suspense} from 'react';
import {render, screen, waitFor, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import {Router, Switch, Route, createRouterContext, Parse, LazyRoute, BoringRoute} from '../index';
import {createMemoryHistory, History} from 'history';

const foo = Route<{id: string; search?: string}>({
    path: '/foo/:id',
    parse: {
        id: Parse.param.string((x) => x || ''),
        search: Parse.query.string((x) => x)
    },
    component: function Foo(props) {
        const routes = useRoutes();
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

const bar = Route<{id: string; search?: string}>({
    path: '/bar/:id',
    parse: {
        id: Parse.param.string((x) => x || ''),
        search: Parse.query.string((x) => x)
    },
    component: function Bar() {
        return <div>Bar Route</div>;
    }
});

const lazy = LazyRoute<{id: string}>({
    path: '/lazy/:id',
    parse: {
        id: Parse.param.string((x) => x || '')
    },
    component: React.lazy(async () => ({
        default: (props) => <div>lazy:{props.args.id}</div>
    }))
});

const boring = BoringRoute({
    path: '/boring',
    component: () => {
        const routes = useRoutes();
        return (
            <div>
                <div title="name">boring</div>
                <div title="to">{routes.boring.to()}</div>
                <div title="href">{routes.boring.href()}</div>
                <a title="push" onClick={() => routes.boringLazy.push()} />
                <a title="replace" onClick={() => routes.boringLazy.replace()} />
            </div>
        );
    }
});

const boringLazy = BoringRoute({
    path: '/boringLazy',
    component: React.lazy(async () => ({
        default: () => <div>boringLazy</div>
    }))
});

const {RoutesProvider, useRoutes} = createRouterContext({
    foo,
    bar,
    lazy,
    boring,
    boringLazy
});

function renderRoute(pathOrHistory: string | History) {
    return render(
        <Suspense fallback={null}>
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
                        {lazy.route}
                        {boring.route}
                        {boringLazy.route}
                    </Switch>
                </RoutesProvider>
            </Router>
        </Suspense>
    );
}

describe('args', () => {
    it('passes args to the component', () => {
        renderRoute('/foo/123?search=baz');
        expect(screen.getByTitle('name').textContent).toBe('Foo Route');
        expect(screen.getByTitle('id').textContent).toBe('123');
        expect(screen.getByTitle('search').textContent).toBe('baz');
    });
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

describe('special route types', () => {
    it('will render lazy routes', async () => {
        renderRoute('/lazy/foo');
        await waitFor(() => expect(screen.getByText('lazy:foo')).toBeInTheDocument());
    });
    it('will render boring routes', () => {
        renderRoute('/boring');
        expect(screen.getByText('boring')).toBeInTheDocument();
    });
    it('will render boring lazy routes', async () => {
        renderRoute('/boringLazy');
        await waitFor(() => expect(screen.getByText('boringLazy')).toBeInTheDocument());
    });
    it('boring routes can transition', () => {
        const history = createMemoryHistory({initialEntries: ['/boring']});
        renderRoute(history);
        expect(screen.getByText('boring')).toBeInTheDocument();
        expect(screen.getByTitle('to').textContent).toBe('/boring');
        expect(screen.getByTitle('href').textContent).toBe('/boring');
        fireEvent.click(screen.getByTitle('push'));
        expect(history.location.pathname).toBe('/boringLazy');
        history.replace('/boring');
        fireEvent.click(screen.getByTitle('replace'));
        expect(history.location.pathname).toBe('/boringLazy');
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
