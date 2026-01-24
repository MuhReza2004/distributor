export interface PelangganFormData {
  namePelanggan: string; // Nama pelanggan
  kodePelanggan: string; // SKU / Kode produk
  namaToko: string; // Nama toko pelanggan
  nib: string; // NIB pelanggan
  alamat: string; // Alamat pelanggan
  noTelp: string; // Nomor telepon pelanggan
  email?: string; // Email pelanggan
  status: "aktif" | "nonaktif";
}

export interface Pelanggan extends PelangganFormData {
  id: string;
  idPelanggan: string;
  createdAt?: Date;
  updatedAt?: Date;
}
