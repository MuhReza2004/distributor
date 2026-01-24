"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogTambahPelanggan } from "@/components/pelanggan/DialogTambahPelanggan";
import { DialogEditPelanggan } from "@/components/pelanggan/DialogEditPelanggan";
import { DialogHapusPelanggan } from "@/components/pelanggan/DialogHapusPelanggan";
import { TabelPelanggan } from "@/components/pelanggan/TabelPelanggan";
import { Pelanggan, PelangganFormData } from "@/app/types/pelanggan";
import { Plus, Search } from "lucide-react";
import {
  addpelanggan,
  deletePelanggan,
  getAllPelanggan,
  updatePelanggan,
} from "@/app/services/pelanggan.service";

export default function PelangganAdminPage() {
  const [customers, setCustomers] = useState<Pelanggan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [dialogTambahOpen, setDialogTambahOpen] = useState(false);
  const [dialogEditOpen, setDialogEditOpen] = useState(false);
  const [dialogHapusOpen, setDialogHapusOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Pelanggan | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");

  // Load pelanggan
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const data = await getAllPelanggan();
        setCustomers(data);
        setError(null);
      } catch (err) {
        setError("Gagal memuat data pelanggan");
        console.error("Error fetching customers:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Show success message
  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Cek apakah NIB sudah ada
  const checkDuplicateNIB = (nib: string) => {
    return customers.find((c) => c.nib === nib);
  };

  // Handle tambah pelanggan dengan validasi NIB
  const handleTambahSubmit = async (data: PelangganFormData) => {
    // Cek duplikasi berdasarkan NIB
    const duplicateNIB = checkDuplicateNIB(data.nib);

    if (duplicateNIB) {
      // NIB sudah terdaftar
      setError(`NIB sudah terdaftar atas nama: ${duplicateNIB.namaToko}`);
      return;
    }

    // Pelanggan baru, tambahkan
    try {
      setIsSubmitting(true);
      const newId = await addpelanggan(data);
      const newCustomer: Pelanggan = {
        idPelanggan: newId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setCustomers((prev) => [newCustomer, ...prev]);
      showSuccess("Pelanggan berhasil ditambahkan");
      setDialogTambahOpen(false);
      setError(null);
    } catch (err) {
      setError("Gagal menambah pelanggan");
      console.error("Error adding customer:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle skip duplicate
  const handleSkipDuplicate = async () => {
    // User memilih untuk tidak menambahkan
  };

  // Handle tambah pelanggan baru meskipun ada duplikasi
  const handleAddNewAnyway = async () => {
    // Tidak digunakan
  };

  // Handle edit pelanggan
  const handleEditSubmit = async (data: PelangganFormData) => {
    if (!selectedCustomer) return;

    try {
      setIsSubmitting(true);
      await updatePelanggan(selectedCustomer.idPelanggan, data);
      setCustomers((prev) =>
        prev.map((c) =>
          c.idPelanggan === selectedCustomer.idPelanggan
            ? { ...c, ...data, updatedAt: new Date() }
            : c,
        ),
      );
      showSuccess("Pelanggan berhasil diperbarui");
      setDialogEditOpen(false);
      setSelectedCustomer(null);
    } catch (err) {
      setError("Gagal memperbarui pelanggan");
      console.error("Error updating customer:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit pelanggan (button click)
  const handleEditClick = (customer: Pelanggan) => {
    setSelectedCustomer(customer);
    setDialogEditOpen(true);
  };

  // Handle delete pelanggan (button click)
  const handleDeleteClick = (customer: Pelanggan) => {
    setSelectedCustomer(customer);
    setDialogHapusOpen(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!selectedCustomer) return;

    try {
      setIsSubmitting(true);
      await deletePelanggan(selectedCustomer.idPelanggan);
      setCustomers((prev) =>
        prev.filter((c) => c.idPelanggan !== selectedCustomer.idPelanggan),
      );
      showSuccess("Pelanggan berhasil dihapus");
      setDialogHapusOpen(false);
      setSelectedCustomer(null);
    } catch (err) {
      setError("Gagal menghapus pelanggan");
      console.error("Error deleting customer:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Manajemen Pelanggan
        </h1>
        <p className="mt-2 text-gray-600">
          Kelola daftar pelanggan dan informasi kontak mereka
        </p>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Search & Button Bar */}
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <div className="flex gap-4 items-end">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari ID, kode, nama, atau nomor telepon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tombol Tambah */}
          <Button
            onClick={() => {
              setSelectedCustomer(null);
              setDialogTambahOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Pelanggan
          </Button>
        </div>
      </div>

      {/* Customers Table */}
      <TabelPelanggan
        customers={customers}
        isLoading={isLoading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        searchTerm={searchTerm}
      />

      {/* Dialog Tambah */}
      <DialogTambahPelanggan
        open={dialogTambahOpen}
        onOpenChange={setDialogTambahOpen}
        onSubmit={handleTambahSubmit}
        isLoading={isSubmitting}
      />

      {/* Dialog Edit */}
      <DialogEditPelanggan
        open={dialogEditOpen}
        onOpenChange={setDialogEditOpen}
        onSubmit={handleEditSubmit}
        pelanggan={selectedCustomer}
        isLoading={isSubmitting}
      />

      {/* Dialog Hapus */}
      <DialogHapusPelanggan
        open={dialogHapusOpen}
        onOpenChange={setDialogHapusOpen}
        onConfirm={handleDeleteConfirm}
        pelanggan={selectedCustomer}
        isLoading={isSubmitting}
      />
    </div>
  );
}
