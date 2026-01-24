export type ProdukStatus = "aktif" | "nonaktif";

export interface ProdukFormData {
  nameProduk: string; // Nama produk
  kodeProduk: string; // SKU / Kode produk
  kategori: string; // Kategori produk
  satuan: string; // Satuan (pcs, sak, kg, liter)
  hargaBeli: number; // Harga beli
  hargaJual: number; // Harga jual
  stok: number; // Stok saat ini
  minimumStok: number; // Minimum stok
  status: ProdukStatus; // Status (aktif / nonaktif)
}

export interface Produk extends ProdukFormData {
  id: string;
  idProduk: string;
  createdAt?: Date;
  updatedAt?: Date;
}
