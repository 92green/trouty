import React from 'react';
import {Route, Parse} from '../../index';
import {useRoutes} from './Router';

export default Route<{search?: string; foo?: number}>({
    path: '/foo',
    parse: {
        search: Parse.query.string.optional(),
        foo: Parse.query.number.optional()
    },
    component: function Foo() {
        const routes = useRoutes();
        return <div title="value">{JSON.stringify(Object.keys(routes))}</div>;
    }
});
