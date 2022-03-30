import React, {Suspense} from 'react';
import {render, screen, waitFor, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import {Route, createRouterContext, Parse} from './index';
import {createMemoryHistory, History} from 'history';

const foo = Route<{id: string; search?: string}>({
    path: '/foo/:id',
    parse: {
        id: Parse.param.string((x) => x || ''),
        search: Parse.query.string((x) => x)
    },
    component: function Foo() {
        const {foo, bar} = useRoutes();
        const id = foo.args.id.useValue();
        const search = foo.args.search?.useValue();
        return (
            <div>
                <div title="name">Foo Route</div>
                <div title="id">{id}</div>
                <div title="search">{search}</div>
                <div title="link">{JSON.stringify(bar.link({id: '456', search: 'purple'}))}</div>
                <div title="href">{bar.link({id: '456', search: 'purple'}).href}</div>
                <a title="push" onClick={() => bar.push({id: 'a', search: 'b'})} />
                <a title="replace" onClick={() => bar.replace({id: 'a', search: 'b'})} />
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

const lazy = Route<{id: string}>({
    path: '/lazy/:id',
    parse: {
        id: Parse.param.string((x) => x || '')
    },
    component: React.lazy(async () => ({
        default: () => {
            const args = useRoutes().lazy.useValue();
            return <div>lazy:{args.id}</div>;
        }
    }))
});

const boring = Route({
    path: '/boring',
    parse: {},
    component: () => {
        const routes = useRoutes();
        return (
            <div>
                <div title="name">boring</div>
                <div title="href">{routes.boring.link({}).href}</div>
                <a title="push" onClick={() => routes.bar.push({id: '1'})} />
            </div>
        );
    }
});

const {RoutesProvider, useRoutes, routes} = createRouterContext({
    foo,
    bar,
    lazy,
    boring
});

function renderRoute(pathOrHistory: string | History) {
    return render(
        <Suspense fallback={null}>
            <RoutesProvider
                history={
                    typeof pathOrHistory === 'string'
                        ? createMemoryHistory({initialEntries: [pathOrHistory]})
                        : pathOrHistory
                }
            >
                {routes.foo}
                {routes.bar}
                {routes.lazy}
                {routes.boring}
            </RoutesProvider>
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
        expect(screen.getByTitle('link').textContent).toBe('{"href":"/bar/456?search=purple"}');
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
    it('boring routes can transition', () => {
        const history = createMemoryHistory({initialEntries: ['/boring']});
        renderRoute(history);
        expect(screen.getByText('boring')).toBeInTheDocument();
        expect(screen.getByTitle('href').textContent).toBe('/boring');
        fireEvent.click(screen.getByTitle('push'));
        expect(history.location.pathname).toBe('/bar/1');
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
