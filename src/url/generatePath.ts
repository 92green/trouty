export default function generatePath(path: string, params = {}): string {
    return path.replace(/:(\w+)/g, (_, key) => params[key]);
    //.replace(/\/*\*$/, (_) => (params['*'] == null ? '' : params['*'].replace(/^\/*/, '/')));
}
