export interface User {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Provider {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "SUSPENDED";
}

export interface GearItem {
  id: string;
  name: string;
  description: string;
  brand: string;
  pricePerDay: number;
  stock: number;
  isAvailable: boolean;
  categoryId: string;
  category?: Category;
  providerId: string;
  provider?: Provider;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RentalItem {
  gearItemId: string;
  quantity: number;
  gearItem?: GearItem;
}

export interface Rental {
  id: string;
  userId: string;
  customer?: User;
  items: RentalItem[];
  startDate: string;
  endDate: string;
  status: "PLACED" | "CONFIRMED" | "PAID" | "PICKED_UP" | "RETURNED" | "CANCELLED";
  totalAmount: number;
  payment?: Payment;
  review?: Review;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  rentalId: string;
  amount: number;
  method: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  transactionId?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  gearItemId: string;
  customerId: string;
  rating: number;
  comment: string;
  customer?: User;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
