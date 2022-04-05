export default function matchPath(pattern: string, pathname: string) {
    const optionalParam = /\((.*?)\)/g;
    const namedParam = /(\(\?)?:\w+/g;
    const escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;
    const splatParam = /\*/g;

    const names: string[] = [];
    pattern = pattern
        .replace(escapeRegExp, '\\$&')
        .replace(optionalParam, '(?:$1)?')
        .replace(namedParam, function (match, optional) {
            names.push(match.slice(1));
            return optional ? match : '([^/?]+)';
        })
        .replace(splatParam, function () {
            names.push('path');
            return '([^?]*?)';
        });

    const regExp = new RegExp('^' + pattern + '(?:\\?([\\s\\S]*))?$');
    const result = regExp.exec(pathname);

    if (result) {
        return result.slice(1, -1).reduce((obj, val, index) => {
            if (val) obj[names[index]] = val;
            return obj;
        }, {} as Record<string, string>);
    }
    return null;
}
