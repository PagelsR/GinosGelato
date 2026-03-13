export type Flavor = {
  id: number;
  name: string;
};

export type Topping = {
  id: number;
  name: string;
  price: number;
};

export type IceCream = {
  id?: number;
  container: 'cone' | 'cup';
  flavors: Flavor[];
  toppings: Topping[];
  price?: number;
};

export type Order = {
  id: number;
  iceCreams: IceCream[];
  totalAmount: number;
  createdAt: string;
};

export type OrderStatus = 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
export type OrderType = 'Pickup' | 'Delivery';

export type ActiveOrderInfo = {
  orderId: number;
  customerName: string;
  status: OrderStatus;
  orderType: OrderType;
  orderDate: string;
  startedAt: string | null;
  elapsedMinutes: number;
  iceCreamCount: number;
};

export type QueueStats = {
  totalInQueue: number;
  pendingCount: number;
  inProgressCount: number;
  averagePrepTimeMinutes: number;
  estimatedWaitMinutes: number;
  activeOrders: ActiveOrderInfo[];
};

export type PeakHourData = {
  hour: number;
  orderCount: number;
  averageWaitMinutes: number;
};

export type DailyMetrics = {
  date: string;
  totalOrders: number;
  completedOrders: number;
  averagePrepTimeMinutes: number;
  totalRevenue: number;
};