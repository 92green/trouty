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
export {Param, Hash, Query, State} from './Parse';
export {BrowserRouter} from 'react-router-dom';
export {Router} from 'react-router-dom';
export {MemoryRouter} from 'react-router-dom';
export {Link} from 'react-router-dom';
export {Switch} from 'react-router-dom';

/*
@todo

- Matching path and params
- Complain about multiple hash parsers
- Throw on missing data
- Allow defaults

*/
