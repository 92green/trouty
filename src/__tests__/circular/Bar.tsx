import React from 'react';
import {Route, Parse} from '../../index';
import {useRoutes} from './Router';

export default Route<{search?: string}>({
    path: '/bar',
    parse: {
        search: Parse.query.string((x) => x)
    },
    component: function Bar() {
        const routes = useRoutes();
        return <div title="value">{JSON.stringify(Object.keys(routes))}</div>;
    }
});
