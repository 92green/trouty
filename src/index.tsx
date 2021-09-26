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

export {Route, LazyRoute, BoringRoute} from './Route';
export {default as createRouterContext} from './RouterContext';
export {default as Parse} from './Parse';
export {BrowserRouter} from 'react-router-dom';
export {Router} from 'react-router-dom';
export {MemoryRouter} from 'react-router-dom';
export {Link} from 'react-router-dom';
export {Switch} from 'react-router-dom';

/*
@todo
- Complain about multiple hash parsers
- Replace react-router with an internal context
    - Don't re-parse the query string on transitions, only external history changes.
- Allow function in transitions
*/
