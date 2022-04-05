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

/*
@todo
- In and Out types
- Make route a component not an element.
- check state still works
- dont update on same state
- Complain about multiple hash parsers
*/
