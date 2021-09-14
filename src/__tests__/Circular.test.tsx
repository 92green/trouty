import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import {MemoryRouter, Switch} from '../index';
import {RoutesProvider, routes} from './circular/Router';

describe('circular structure', () => {
    it('will not break with the semi circular dependency structure', () => {
        render(
            <MemoryRouter initialEntries={['/foo']}>
                <RoutesProvider>
                    <Switch>{Object.values(routes)}</Switch>
                </RoutesProvider>
            </MemoryRouter>
        );
        const keys = JSON.parse(screen.getByTitle('value').textContent || '[]');
        expect(keys).toEqual(['foo', 'bar']);
    });
});
