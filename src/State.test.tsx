import State from './State';
import Parse from './Parse';
import Route from './Route';
import {createMemoryHistory} from 'history';

function createTestState(initialEntries: string[] = ['/foo']) {
    return new State(createMemoryHistory({initialEntries}), {
        foo: Route<{a: string; b: number}>({
            path: '/foo',
            parse: {
                a: Parse.query.string((x) => x || ''),
                b: Parse.query.number((x) => x || 0)
            },
            component: () => null
        }),
        bar: Route<{}>({
            path: '/bar',
            parse: {},
            component: () => null
        })
    });
}

describe('constructor', () => {
    it('creates route and arg objects based on config', () => {
        const state = createTestState();
        expect(state.routes.foo).toBeDefined();
        expect(state.routes.foo.args.a).toBeDefined();
        expect(state.routes.foo.args.b).toBeDefined();

        const argShape = {
            useValue: expect.any(Function),
            push: expect.any(Function),
            replace: expect.any(Function),
            link: expect.any(Function)
        };
        expect(state.routes.foo).toMatchObject({
            ...argShape,
            args: expect.objectContaining({
                a: argShape,
                b: argShape
            })
        });
    });

    it('parses the state of the current route', () => {
        const match = createTestState(['/foo?a=rad&b=4']);
        expect(match.activeRoute).toBe('foo');
        expect(match.state.foo).toEqual({a: 'rad', b: 4});

        const noMatch = createTestState(['/blah']);
        expect(noMatch.activeRoute).toBe(null);
        expect(noMatch.state.foo).toEqual({});
    });
});

describe('next', () => {
    it('creates a state like object if args is provided', () => {
        const state = createTestState();
        expect(state.next(4, 'b')).toEqual({b: 4});
        expect(state.next(4)).toEqual(4);
    });
});

describe('makeUpdater', () => {
    it('creates a route callback that will transition', () => {
        const state = createTestState(['/foo?a=before']);
        const updater = state.makeUpdater('push', 'foo');
        expect(updater).toEqual(expect.any(Function));
        expect(state.state.foo.a).toBe('before');
        updater({a: 'after', b: 2});
        expect(state.state.foo.a).toBe('after');
        expect(state.state.foo.b).toBe(2);
    });

    it('creates an arg callback that will transition', () => {
        const state = createTestState(['/foo?a=before']);
        const updater = state.makeUpdater('push', 'foo', 'a');
        expect(updater).toEqual(expect.any(Function));
        expect(state.state.foo.a).toBe('before');
        updater('after');
        expect(state.state.foo.a).toBe('after');
    });
});

describe('makeStaticUpdater', () => {
    it('creates a route callback that returns a props object', () => {
        const state = createTestState(['/foo?a=before&b=4:']);
        const updater = state.makeStaticUpdater('foo');
        expect(updater).toEqual(expect.any(Function));
        const update = updater({a: 'after', b: 12});
        expect(update.href).toBe('/foo?a=after&b=12');
        expect(state.state.foo.a).toBe('before');
        update.onClick({button: 0, preventDefault: jest.fn()} as any);
        expect(state.state.foo.a).toBe('after');
    });

    it('onClick prop will only fire on left clicks', () => {
        const state = createTestState(['/foo?a=before&b=4:']);
        const updater = state.makeStaticUpdater('foo');
        updater({a: 'after', b: 12}).onClick({button: 1} as any);
        expect(state.state.foo.a).toBe('before');
    });
});

describe('transition/subscribe', () => {
    it('it will publish * * if the active route changes', () => {
        const state = createTestState(['/foo?a=before&b=4:']);
        const sub = jest.fn();
        state.subscribe('*', '*', sub);
        state.transition('bar', {}, 'push');
        expect(sub).toHaveBeenCalledWith('bar');
    });

    it('it will publish route state changes', () => {
        const state = createTestState(['/foo?a=before&b=4:']);
        const sub = jest.fn();
        state.subscribe('foo', '*', sub);
        state.transition('foo', {a: 'after', b: 2}, 'push');
        expect(sub).toHaveBeenCalledWith({a: 'after', b: 2});
    });

    it('it will publish arg state changes', () => {
        const state = createTestState(['/foo?a=before&b=4:']);
        const sub = jest.fn();
        state.subscribe('foo', 'a', sub);
        state.transition('foo', {a: 'after', b: 2}, 'push');
        expect(sub).toHaveBeenCalledWith('after');
    });

    it('subscribe will return unsubscribe function', () => {
        const state = createTestState(['/foo?a=before&b=4:']);
        const sub = jest.fn();
        const unsubscribe = state.subscribe('foo', 'a', sub);
        state.transition('foo', {a: 'after', b: 2}, 'push');
        expect(sub).toHaveBeenCalledWith('after');
        unsubscribe();
        state.transition('foo', {a: 'again', b: 2}, 'push');
        expect(sub).toHaveBeenLastCalledWith('after');
        expect(sub).toHaveBeenCalledTimes(1);
    });
});

describe('useValue', () => {
    it.todo('it will subscribe to route changes');
    it.todo('it will subscribe to arg changes');
    it.todo('it will default to existing route values');
    it.todo('it will default to existing arg values');
});

describe('useActiveRoute', () => {
    it.todo('it will subscribe to changes in the active route');
});
