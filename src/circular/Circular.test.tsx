import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import {createMemoryHistory} from 'history';
import {RoutesProvider, routes} from './Router';

describe('circular structure', () => {
    it('will not break with the semi circular dependency structure', () => {
        render(
            <RoutesProvider history={createMemoryHistory({initialEntries: ['/foo']})}>
                {routes.foo}
                {routes.bar}
            </RoutesProvider>
        );
        const keys = JSON.parse(screen.getByTitle('value').textContent || '[]');
        expect(keys).toEqual(['foo', 'bar']);
    });
});
