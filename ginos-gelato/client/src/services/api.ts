import axios from 'axios';

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