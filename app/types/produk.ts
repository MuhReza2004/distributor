export interface ProdukFormData {
  name: string; // Nama produk
  unit: string; // Satuan (dus, pcs, kg, liter)
  buyPrice: number; // Harga beli
  sellPrice: number; // Harga jual
}

export interface Produk extends ProdukFormData {
  id: string;
  code: string;
  createdAt?: Date;
  updatedAt?: Date;
}
