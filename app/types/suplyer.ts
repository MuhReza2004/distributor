export interface SupplierProduct {
  productId: string; // optional refer ke master product
  name: string;
}

export interface SupplierFormData {
  name: string;
  address: string;
  products: SupplierProduct[];
  isActive: boolean;
}

export interface Supplier extends SupplierFormData {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SupplierDetail extends Supplier {
  products: SupplierProduct[];
}

export interface SupplierProductDetail extends SupplierProduct {
  buyPrice: number;
  sellPrice: number;
  stock: number;
}
