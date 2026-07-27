import axios from 'axios';
import { appInsights } from './appInsights';
import { 
    shouldSimulateError, 
    simulateNetworkError, 
    simulateCorsError, 
    simulateTimeoutError,
    isDemoMode 
} from '../utils/demoErrors';

const API_BASE_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/api`;

// Shape of the create-order request expected by the API.
export interface OrderItemRequest {
    container: string;
    flavors: string[];
    toppings: string[];
}

export interface CreateOrderRequest {
    customerName: string;
    email: string;
    phone: string;
    fulfillmentType: 'Pickup' | 'Delivery' | 'Shipping';
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    specialInstructions?: string;
    items: OrderItemRequest[];
}

export interface OrderResponse {
    id: number;
    confirmationNumber: string;
    customerName: string;
    fulfillmentType: string;
    subtotal: number;
    tax: number;
    deliveryFee: number;
    shippingFee: number;
    total: number;
    status: string;
    orderDate: string;
    items: Array<{ container: string; flavors: string[]; toppings: string[]; linePrice: number }>;
}

// Function to get all flavors
export const getFlavors = async () => {
    try {
        // Demo: Simulate network errors 5% of the time (occasional)
        if (shouldSimulateError(0.05)) {
            const demoError = Math.random() > 0.5 ? simulateNetworkError() : simulateCorsError();
            throw demoError;
        }
        
        const response = await axios.get(`${API_BASE_URL}/flavors`);
        appInsights.trackTrace({ message: 'Flavors fetched successfully' }, { count: response.data.length });
        return response.data;
    } catch (error) {
        console.error('Error fetching flavors:', error);
        appInsights.trackException(
            { exception: error as Error },
            { 
                api: 'getFlavors', 
                endpoint: `${API_BASE_URL}/flavors`,
                demoMode: isDemoMode()
            }
        );
        throw error;
    }
};

// Function to get all toppings
export const getToppings = async () => {
    try {
        // Demo: Simulate CORS errors 3% of the time (occasional)
        if (shouldSimulateError(0.03)) {
            throw simulateCorsError();
        }
        
        const response = await axios.get(`${API_BASE_URL}/toppings`);
        appInsights.trackTrace({ message: 'Toppings fetched successfully' }, { count: response.data.length });
        return response.data;
    } catch (error) {
        console.error('Error fetching toppings:', error);
        appInsights.trackException(
            { exception: error as Error },
            { 
                api: 'getToppings', 
                endpoint: `${API_BASE_URL}/toppings`,
                demoMode: isDemoMode()
            }
        );
        throw error;
    }
};

// Function to create a new order
export const createOrder = async (orderData: CreateOrderRequest): Promise<OrderResponse> => {
    try {
        // Demo: Simulate timeout errors 2% of the time (rare)
        if (shouldSimulateError(0.02)) {
            throw simulateTimeoutError();
        }
        
        const response = await axios.post<OrderResponse>(`${API_BASE_URL}/orders`, orderData);
        appInsights.trackTrace({ message: 'Order created successfully' }, { orderId: response.data.id });
        return response.data;
    } catch (error) {
        console.error('Error creating order:', error);
        appInsights.trackException(
            { exception: error as Error },
            { 
                api: 'createOrder', 
                endpoint: `${API_BASE_URL}/orders`, 
                demoMode: isDemoMode()
            }
        );
        throw error;
    }
};

// Demo fault: trigger a deterministic slow Azure SQL dependency on the API so a
// slow-query scenario appears in Application Insights on demand. Opt-in only.
export const triggerSlowSql = async (): Promise<{ fault: string; delaySeconds: number }> => {
    const startedAt = Date.now();
    const response = await axios.get(`${API_BASE_URL}/demo/slow-sql`);
    const durationMs = Date.now() - startedAt;
    appInsights.trackEvent(
        { name: 'DemoFaultTriggered' },
        { fault: 'slow-sql', durationMs: String(durationMs) }
    );
    return response.data;
};

// Demo fault: trigger a deterministic API failure (503) so a failed request /
// dependency appears in Application Insights on demand. Opt-in only.
export const triggerApiFailure = async (): Promise<never> => {
    try {
        await axios.get(`${API_BASE_URL}/demo/api-failure`);
        // The endpoint always fails when enabled; reaching here means it is disabled.
        throw new Error('Demo API failure endpoint did not fail (faults may be disabled).');
    } catch (error) {
        appInsights.trackException(
            { exception: error as Error },
            { api: 'triggerApiFailure', endpoint: `${API_BASE_URL}/demo/api-failure`, fault: 'api-failure' }
        );
        appInsights.trackEvent({ name: 'DemoFaultTriggered' }, { fault: 'api-failure' });
        throw error;
    }
};