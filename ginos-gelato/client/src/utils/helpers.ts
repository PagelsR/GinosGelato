import { IceCream, Flavor } from '../types';

export const calculateTotalPrice = (items: IceCream[]): number => {
    return items.reduce((total, item) => total + (item.price || 0), 0);
};

export const formatFlavorList = (flavors: Flavor[]): string => {
    return flavors.map(flavor => flavor.name).join(', ');
};

export const validateOrder = (order: IceCream): string | null => {
    if (!order.container) {
        return 'Please select a container type.';
    }
    if (order.flavors.length === 0) {
        return 'Please select at least one flavor.';
    }
    if (order.flavors.length > 3) {
        return 'You can select up to three flavors.';
    }
    return null;
};