import React from 'react';

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
    reloadDocument?: boolean;
    replace?: boolean;
    state?: any;
    to: To;
}
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function LinkWithRef(
    {onClick, reloadDocument, replace = false, state, target, to, ...rest},
    ref
) {
    let href = useHref(to);
    const internalOnClick = React.useCallback(
        (event: React.MouseEvent<E, MouseEvent>) => {
            if (
                event.button === 0 && // Ignore everything but left clicks
                (!target || target === '_self') && // Let browser handle "target=_blank" etc.
                !isModifiedEvent(event) // Ignore clicks with modifier keys
            ) {
                event.preventDefault();

                // If the URL hasn't changed, a regular <a> will do a replace instead of
                // a push, so do the same here.
                let replace = !!replaceProp || createPath(location) === createPath(path);

                navigate(to, {replace, state});
            }
        },
        [location, navigate, path, replaceProp, state, target, to]
    );

    function handleClick(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
        onClick?.(event);
        if (!event.defaultPrevented && !reloadDocument) {
            internalOnClick(event);
        }
    }

    return (
        // eslint-disable-next-line jsx-a11y/anchor-has-content
        <a {...rest} href={href} onClick={handleClick} ref={ref} target={target} />
    );
});
