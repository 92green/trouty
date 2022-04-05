import matchPath from './matchPath';

describe('matchPath', () => {
    it('returns null when there is no match', () => {
        expect(matchPath('/foo', '/bar')).toBe(null);
    });
    it('returns params', () => {
        expect(matchPath('/foo/:id', '/foo/bar')).toEqual({id: 'bar'});
    });
    it('returns an empty object if a plain route matches', () => {
        expect(matchPath('/foo', '/foo')).toEqual({});
    });
});
