"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addProduk } from "@/app/services/produk.service";
import { getAllSuppliers } from "@/app/services/supplyer.service";
import { ProdukFormData } from "@/app/types/produk";
import { Supplier } from "@/app/types/suplyer";
import { formatRupiah } from "@/helper/format";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function DialogTambahProduk({
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const [formData, setFormData] = useState<ProdukFormData>({
    supplyerName: "",
    dateReceived: "",
    contractNumber: "",
    invoiceNumber: "",
    warehouseOrigin: "",
    npb: "",
    name: "",
    unit: "dus",
    buyPrice: 0,
    stock: 0,
  });

  useEffect(() => {
    const loadSuppliers = async () => {
      const data = await getAllSuppliers();
      setSuppliers(data);
    };
    loadSuppliers();
  }, []);

  useEffect(() => {
    if (open) {
      setFormData({
        supplyerName: "",
        dateReceived: "",
        contractNumber: "",
        invoiceNumber: "",
        warehouseOrigin: "",
        npb: "",
        name: "",
        unit: "dus",
        buyPrice: 0,
        stock: 0,
      });
      setSelectedSupplier(null);
    }
  }, [open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (name === "supplyerName") {
      const supplier = suppliers.find((s) => s.name === value);
      setSelectedSupplier(supplier || null);
      setFormData((p) => ({
        ...p,
        supplyerName: value,
        name: "", // Reset nama produk ketika supplier berubah
      }));
      return;
    }

    if (name === "name") {
      // Ketika produk dipilih dari dropdown
      setFormData((p) => ({
        ...p,
        name: value,
      }));
      return;
    }

    if (name === "buyPrice" || name === "sellPrice") {
      const numeric = value.replace(/\D/g, "");
      setFormData((p) => ({ ...p, [name]: Number(numeric) }));
      return;
    }

    if (type === "number") {
      setFormData((p) => ({ ...p, [name]: Number(value) }));
      return;
    }

    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await addProduk(formData);

    setLoading(false);
    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl rounded-xl border-0 p-6">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Tambah Produk Baru
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            ID & kode produk dibuat otomatis oleh sistem. Isi detail produk di
            bawah ini.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Section: Informasi Supplier */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                1
              </span>
              Informasi Supplier
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-700">
                  Nama Supplier <span className="text-red-500">*</span>
                </Label>
                <select
                  name="supplyerName"
                  value={formData.supplyerName}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- Pilih Supplier --</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.name}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Tanggal Penerimaan <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="dateReceived"
                  value={formData.dateReceived}
                  type="date"
                  onChange={handleChange}
                  required
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Nomor Kontrak <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="contractNumber"
                  value={formData.contractNumber}
                  placeholder="Masukkan nomor kontrak"
                  onChange={handleChange}
                  required
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Nomor Faktur <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  placeholder="Masukkan nomor faktur"
                  onChange={handleChange}
                  required
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  NPB(No Penerimaan Barang){" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="npb"
                  value={formData.npb}
                  placeholder="Masukkan NPB(Nomor Penerimaan Barang)"
                  onChange={handleChange}
                  required
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Asal Gudang
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="warehouseOrigin"
                  value={formData.warehouseOrigin}
                  placeholder="Masukkan Asal Gudang"
                  onChange={handleChange}
                  required
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Section: Informasi Produk */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                2
              </span>
              Informasi Produk
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-700">
                  Nama Produk <span className="text-red-500">*</span>
                </Label>
                {selectedSupplier && selectedSupplier.products.length > 0 ? (
                  <select
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:border-green-500 focus:ring-green-500 bg-white"
                  >
                    <option value="">-- Pilih Produk --</option>
                    {selectedSupplier.products.map((product) => (
                      <option key={product.productId} value={product.name}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    name="name"
                    value={formData.name}
                    placeholder="Pilih supplier terlebih dahulu"
                    onChange={handleChange}
                    required
                    className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md bg-gray-50"
                    disabled
                  />
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Jumlah Stok <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="stock"
                  type="number"
                  value={formData.stock}
                  placeholder="0"
                  onChange={handleChange}
                  required
                  min="0"
                  className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Satuan <span className="text-red-500">*</span>
                </Label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:border-green-500 focus:ring-green-500 bg-white"
                >
                  <option value="dus">Dus</option>
                  <option value="pcs">Pcs</option>
                  <option value="kg">Kg</option>
                  <option value="liter">Liter</option>
                  <option value="sak">Sak</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Informasi Harga */}
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="bg-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                3
              </span>
              Informasi Harga
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Harga Beli Satuan <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="buyPrice"
                  value={formatRupiah(formData.buyPrice)}
                  placeholder="Rp 0"
                  onChange={handleChange}
                  required
                  className="mt-1 border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Harga pembelian dari supplier
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-md hover:bg-gray-100"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Menyimpan..." : "Simpan Produk"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
