export type ProdukStatus = "aktif" | "nonaktif";

export interface ProdukFormData {
  kode: string; // Kode produk (SKU)
  nama: string; // Nama produk
  satuan: string; // Satuan (pcs, sak, kg, liter)
  kategori: string; // Kategori produk
  hargaJual: number; // Harga jual
  stok: number; // Stok saat ini
  minStok: number; // Minimum stok
  status: ProdukStatus; // Status (aktif / nonaktif)
}

export interface Produk extends ProdukFormData {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}
