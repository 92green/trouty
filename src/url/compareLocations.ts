import {createPath, LocationDescriptorObject} from 'history';

export default function compareLocations(a: LocationDescriptorObject, b: LocationDescriptorObject) {
    return createPath(a) === createPath(b) && JSON.stringify(a.state) === JSON.stringify(b.state);
}
