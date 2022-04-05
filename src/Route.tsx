import {ComponentType, LazyExoticComponent} from 'react';
import Parse from './Parse';

export type RouteConfig<Input, Output> = {
    __input: Input;
    __output: Output;
    path: string;
    component: ComponentType<any> | LazyExoticComponent<any>;
    parse: {
        [K in keyof Input]-?: {} extends Pick<Input, K>
            ? Parse<Input[K] | undefined>
            : Parse<Input[K]>;
    };
};

/**
The Route function is a wrapper around a component that describes what parts of the url are required by this component.
- config.path: The url you want to map to
- config.parse: a parsing object that matches your `args`
*/

type RouterConfigInput<Input, Output> = Omit<RouteConfig<Input, Output>, '__input' | '__output'>;
export default function Route<Input = Record<string, any>, Output = void>(
    config: RouterConfigInput<Input, Output>
): RouteConfig<Input, Output> {
    const __input = null as unknown as Input;
    const __output = null as unknown as Output;
    return {...config, __input, __output};
}
