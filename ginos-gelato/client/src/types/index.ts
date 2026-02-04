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