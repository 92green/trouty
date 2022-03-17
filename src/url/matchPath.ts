// @todo - this works but is doing way more than it needs to as
// Trouty has much simpler routing requirements.

/**
 * Performs pattern matching on a URL pathname and returns information about
 * the match.
 *
 * @see https://reactrouter.com/docs/en/v6/api#matchpath
 */
export default function matchPath(pattern: string, pathname: string) {
    if (typeof pattern === 'string') {
        pattern = {path: pattern, caseSensitive: false, end: true};
    }

    let [matcher, paramNames] = compilePath(pattern.path, pattern.caseSensitive, pattern.end);

    let match = pathname.match(matcher);
    if (!match) return null;

    let matchedPathname = match[0];
    let pathnameBase = matchedPathname.replace(/(.)\/+$/, '$1');
    let captureGroups = match.slice(1);
    let params: Params = paramNames.reduce<Mutable<Params>>((memo, paramName, index) => {
        // We need to compute the pathnameBase here using the raw splat value
        // instead of using params["*"] later because it will be decoded then
        if (paramName === '*') {
            let splatValue = captureGroups[index] || '';
            pathnameBase = matchedPathname
                .slice(0, matchedPathname.length - splatValue.length)
                .replace(/(.)\/+$/, '$1');
        }

        memo[paramName] = safelyDecodeURIComponent(captureGroups[index] || '', paramName);
        return memo;
    }, {});

    return {
        params,
        pathname: matchedPathname,
        pathnameBase,
        pattern
    };
}

function compilePath(path: string, caseSensitive = false, end = true): [RegExp, string[]] {
    let paramNames: string[] = [];
    let regexpSource =
        '^' +
        path
            .replace(/\/*\*?$/, '') // Ignore trailing / and /*, we'll handle it below
            .replace(/^\/*/, '/') // Make sure it has a leading /
            .replace(/[\\.*+^$?{}|()[\]]/g, '\\$&') // Escape special regex chars
            .replace(/:(\w+)/g, (_: string, paramName: string) => {
                paramNames.push(paramName);
                return '([^\\/]+)';
            });

    if (path.endsWith('*')) {
        paramNames.push('*');
        regexpSource +=
            path === '*' || path === '/*'
                ? '(.*)$' // Already matched the initial /, just match the rest
                : '(?:\\/(.+)|\\/*)$'; // Don't include the / in params["*"]
    } else {
        regexpSource += end
            ? '\\/*$' // When matching to the end, ignore trailing slashes
            : // Otherwise, match a word boundary or a proceeding /. The word boundary restricts
              // parent routes to matching only their own words and nothing more, e.g. parent
              // route "/home" should not match "/home2".
              // Additionally, allow paths starting with `.`, `-`, `~`, and url-encoded entities,
              // but do not consume the character in the matched path so they can match against
              // nested paths.
              '(?:(?=[.~-]|%[0-9A-F]{2})|\\b|\\/|$)';
    }

    let matcher = new RegExp(regexpSource, caseSensitive ? undefined : 'i');

    return [matcher, paramNames];
}

function safelyDecodeURIComponent(value: string) {
    try {
        return decodeURIComponent(value);
    } catch (error) {
        return value;
    }
}
