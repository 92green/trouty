import {createRouterContext} from '../../src/index';
import foo from './Foo';
import bar from './Bar';

const {RoutesProvider, useRoutes, routes} = createRouterContext({
    foo,
    bar
});

export {useRoutes, RoutesProvider, routes};
