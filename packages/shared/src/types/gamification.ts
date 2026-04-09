export interface Product {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  coinPrice: number;
  stock: number;
  isActive: boolean;
}

export interface Order {
  id: number;
  studentId: number;
  studentName: string;
  productId: number;
  productName: string;
  coinAmount: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}
