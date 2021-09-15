# Trouty

A typesafe router for react, built on top of react router.

String templating routes is fraught with danger, and mixing params and query parameters is a pain. Let trouty take care of that.


## Getting Started

```
yarn add trouty
```

### 1. Define some routes
The Route function is a wrapper around a component that describes what parts of the url are required by this component.
Route takes a generic `args` parameter, which is combined with a path and a parsing object. 
Trouty then takes care of parsing to and from params, the query string, the hash, or state.

The result is a series of typed functions that either return a url, or make calls to history.push/replace.
You call your routes by name, provide the required args, and Trouty takes care of turning that to a valid url


```tsx
// UserRoutes.ts
import {Route, Parse, Link} from 'trouty';

// UserItem wants a string id from params
export const UserItem = Route<{id: string}>({
    path: '/user/:id',
    parse: {
        id: Parse.param.string
    },
    component: (props) => {
        const routes = useRoutes();
        return <div>
            <h1>User: {props.args.id}</h1>
            <Link to={routes.UserList.to({search: '', page: 1})}>Back to list</Link>
        </div>
    }
});

// UserList wants two values from the query string: a search string, and a page number.
export const UserList = Route<{search: string, page: number}>({
    path: '/user/:id',
    parse: {
        search: Parse.query.string,
        page: Parse.query.number
    },
    component: (props) => {
        const routes = useRoutes();
        // Maybe here we use props.args.search for filtering a list of users
        return <div>
            <h1>User List</h1>
            <Link to={routes.UserItem.to({id: 'foo'})>Go to foo user</Link>
        </div>
    }
});

```

### 2. Build a context
Once your routes are defined you can bring them together in a route context. This context is the namespace that defines what routes are allowed to be transitioned to.
`createRouteContext` returns a providers, an access hook for your components, and an object of route components for you to render.

```ts
// RouteContext.ts
import {createRouteContext} from 'trouty';
import {UserItem, UserList} from './UserRoutes';

const {RoutesProvider, useRoutes, routes} = createRouteContext({
    UserItem,
    UserList
});

export {RoutesProvider, useRoutes, routes};

```

### 2. Wrap your providers
Now we can wrap out RoutesProvider in a BrowserRouter and place our route elements in a switch.
Routes is object that matches the shape given to createRouteContext, this allows you to split your routes up over multiple switches and render them in what ever component makes sense.
In this example we are using Object.values to just place all the routes in a single switch

```tsx
import {BrowserRouter, Switch} from 'trouty';
import {RoutesProvider, routes} from './RouteContext';

function App() {
    return <BrowserRouter>
        <RoutesProvider>
            <Switch>{Object.values(routes)}</Switch>
        </RoutesProvider>
    </BrowserRouter>
}
```






