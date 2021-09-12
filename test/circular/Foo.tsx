import React from 'react';
import {Route, Parse} from '../../src/index';
import {useRoutes} from './Router';

export default Route<{search: string}>({
    path: '/foo',
    parse: {
        search: Parse.queryString
    },
    component: function Foo() {
        const routes = useRoutes();
        return <div title="value">{JSON.stringify(Object.keys(routes))}</div>;
    }
});
