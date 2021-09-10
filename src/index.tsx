/*

 
   /$$                                     /$$              
  | $$                                    | $$              
 /$$$$$$    /$$$$$$   /$$$$$$  /$$   /$$ /$$$$$$   /$$   /$$
|_  $$_/   /$$__  $$ /$$__  $$| $$  | $$|_  $$_/  | $$  | $$
  | $$    | $$  \__/| $$  \ $$| $$  | $$  | $$    | $$  | $$
  | $$ /$$| $$      | $$  | $$| $$  | $$  | $$ /$$| $$  | $$
  |  $$$$/| $$      |  $$$$$$/|  $$$$$$/  |  $$$$/|  $$$$$$$
   \___/  |__/       \______/  \______/    \___/   \____  $$
                                                   /$$  | $$
                                                  |  $$$$$$/
                                                   \______/ 
*/

export {default as Route} from './Route';
export {default as createRouterContext} from './RouterContext';
export {default as Parse} from './Parse';
export {BrowserRouter} from 'react-router-dom';
export {MemoryRouter} from 'react-router-dom';
export {Link} from 'react-router-dom';

//
// Context

//import {Route, Hash, Param, Query, Link} from 'trouty';

//const a = Route<{foo: number}>({
//path: '/user/:id',
//parse: {},
//component: function UserItem(props) {
//const routes = useRoutes();
//return <Link to={routes.b.to({})}> Go to b</Link>;
//}
//});

//const b = Route<{bar: string}>({
//path: '/user/:id',
//parse: {},
//component: function UserItem(props) {
//const routes = useRoutes();
//return <Link to={routes.a.to({})}> Go to a</Link>;
//}
//});

//// probably in another file
//const {RoutesProvider, useRoutes} = createRouterContext({
//a,
//b
//});
