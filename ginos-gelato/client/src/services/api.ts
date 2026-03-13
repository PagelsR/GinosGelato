import axios from 'axios';
import type { QueueStats, PeakHourData, DailyMetrics, OrderStatus, OrderType } from '../types';

const API_BASE_URL = 'http://localhost:5000/api'; // Adjust the base URL as needed

// Function to get all flavors
export const getFlavors = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/flavors`);
        return response.data;
    } catch (error) {
        console.error('Error fetching flavors:', error);
        throw error;
    }
};

// Function to get all toppings
export const getToppings = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/toppings`);
        return response.data;
    } catch (error) {
        console.error('Error fetching toppings:', error);
        throw error;
    }
};

// Function to create a new order
export const createOrder = async (orderData: any) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/orders`, orderData);
        return response.data;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

// Function to update order status
export const updateOrderStatus = async (orderId: number, status: OrderStatus) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/orders/${orderId}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
};

// Queue management API functions

export const getQueueStats = async (): Promise<QueueStats> => {
    const response = await axios.get(`${API_BASE_URL}/queue/stats`);
    return response.data;
};

export const getAveragePrepTime = async (orderType?: OrderType): Promise<{ averagePrepTimeMinutes: number; orderType: OrderType | null }> => {
    const params = orderType ? { orderType } : {};
    const response = await axios.get(`${API_BASE_URL}/queue/average-prep-time`, { params });
    return response.data;
};

export const getPeakHours = async (days = 7): Promise<PeakHourData[]> => {
    const response = await axios.get(`${API_BASE_URL}/queue/peak-hours`, { params: { days } });
    return response.data;
};

export const getHistoricalMetrics = async (days = 30): Promise<DailyMetrics[]> => {
    const response = await axios.get(`${API_BASE_URL}/queue/history`, { params: { days } });
    return response.data;
};

export const exportOrdersCsv = async (days = 30): Promise<void> => {
    const response = await axios.get(`${API_BASE_URL}/queue/export/csv`, {
        params: { days },
        responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const filename = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};