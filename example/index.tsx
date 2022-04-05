import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {createRouterContext, Route, Parse} from '../dist/index';

function color() {
    return '#' + (Math.random().toString(16) + '00000').slice(2, 8);
}

const {routes, RoutesProvider, useRoutes} = createRouterContext({
    person: Route<{name: string; pet: string}, {name?: string; pet?: string}>({
        path: '/person',
        parse: {
            name: Parse.query.string((x) => x || ''),
            pet: Parse.query.string((x) => x || '')
        },
        component: (props: {id: string}) => {
            return (
                <div style={{padding: '2rem'}}>
                    <Nav />
                    <Section route="person" param="name" />
                    <Section route="person" param="pet" />
                    <Section route="person" param="name" />
                    <Section route="person" param="pet" />
                    <All />
                </div>
            );
        }
    }),
    pet: Route<{name: string}>({
        path: '/pet',
        parse: {
            name: Parse.query.string((x) => x || '')
        },
        component: () => {
            return (
                <div style={{padding: '2rem'}}>
                    <Nav />
                    <Section route="pet" param="name" />
                </div>
            );
        }
    }),
    home: Route({
        path: '/',
        parse: {},
        component: () => {
            return (
                <div style={{padding: '2rem'}}>
                    <Nav />
                    Home
                </div>
            );
        }
    })
});

function Section({param, route}: {route: string; param: 'name' | 'pet'}) {
    const routes = useRoutes();
    const value = routes[route].args[param].useValue();
    routes.pet.useValue();

    return (
        <fieldset style={{backgroundColor: color(), marginBottom: '2rem', padding: '1rem'}}>
            <legend>{param}</legend>
            <input
                value={value}
                onChange={(e) => routes[route].args[param].replace(e.target.value)}
            />
        </fieldset>
    );
}

function All() {
    const {person} = useRoutes();
    const value = person.useValue();
    return (
        <fieldset style={{backgroundColor: color(), marginBottom: '2rem', padding: '1rem'}}>
            <legend>*</legend>
            <span>{JSON.stringify(value)}</span>
        </fieldset>
    );
}

const Nav = React.memo(function () {
    const routes = useRoutes();
    const value = routes.person.useValue();
    return (
        <div>
            <a {...routes.home.link({})}>Home</a>
            <span> | </span>
            <a {...routes.person.link({name: 'foo', pet: 'bar'})}>Person</a>
            <span> | </span>
            <a {...routes.person.link({...value, name: 'test'})}>partial person</a>
            <span> | </span>
            <a {...routes.pet.link({name: 'sparky'})}>Pet</a>
            <span> | </span>
        </div>
    );
});

const {person: Person, pet: Pet, home: Home} = routes;
const App = () => {
    return (
        <RoutesProvider>
            <Person />
            <Pet />
            <Home />
        </RoutesProvider>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
