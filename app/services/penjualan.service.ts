import {
  addDoc,
  collection,
  updateDoc,
  doc,
  increment,
  getDocs,
  getDoc,
  orderBy,
  query,
  runTransaction,
  where,
} from "firebase/firestore";
import { Penjualan, PenjualanDetail } from "@/app/types/penjualan";
import { db } from "../lib/firebase";
import { Produk } from "@/app/types/produk";

export const createPenjualan = async (data: Penjualan) => {
  // Use a transaction to ensure stock validation and updates are atomic
  await runTransaction(db, async (transaction) => {
    // 1. Validate stock for all items
    for (const item of data.items || []) {
      const supplierProdukRef = doc(
        db,
        "supplier_produk",
        item.supplierProdukId,
      );
      const supplierProdukDoc = await transaction.get(supplierProdukRef);

      if (!supplierProdukDoc.exists()) {
        throw new Error(`Produk supplier tidak ditemukan.`);
      }

      const currentStok = supplierProdukDoc.data().stok;
      if (currentStok < item.qty) {
        throw new Error(
          `Stok produk tidak mencukupi. Sisa stok: ${currentStok}`,
        );
      }
    }

    // 2. If all validations pass, create the sale and update stock
    const penjualanRef = doc(collection(db, "penjualan")); // Create a new doc ref
    const penjualanData = { ...data };
    delete penjualanData.items; // Remove items from main document
    transaction.set(penjualanRef, { ...penjualanData, createdAt: new Date() });

    // Create penjualan_detail documents
    for (const item of data.items || []) {
      await addDoc(collection(db, "penjualan_detail"), {
        penjualanId: penjualanRef.id,
        supplierProdukId: item.supplierProdukId,
        qty: item.qty,
        harga: item.harga,
        subtotal: item.subtotal,
      });

      // Update stock
      const supplierProdukRef = doc(
        db,
        "supplier_produk",
        item.supplierProdukId,
      );
      transaction.update(supplierProdukRef, {
        stok: increment(-item.qty),
      });
    }
  });
};

export const getAllPenjualan = async (): Promise<Penjualan[]> => {
  const q = query(collection(db, "penjualan"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  const penjualanList: Penjualan[] = [];

  for (const docSnap of snap.docs) {
    const penjualanData = docSnap.data() as Penjualan;
    const penjualanId = docSnap.id;

    // Fetch pelanggan name - try by document id first
    let pelangganData = null;
    const pelangganDoc = await getDoc(
      doc(db, "pelanggan", penjualanData.pelangganId),
    );

    if (pelangganDoc.exists()) {
      pelangganData = pelangganDoc.data();
    } else {
      // Fallback: search by idPelanggan field
      const pelangganQuery = query(
        collection(db, "pelanggan"),
        where("idPelanggan", "==", penjualanData.pelangganId),
      );
      const pelangganSnap = await getDocs(pelangganQuery);
      if (!pelangganSnap.empty) {
        pelangganData = pelangganSnap.docs[0].data();
      }
    }

    // Fetch details
    const detailQuery = query(
      collection(db, "penjualan_detail"),
      where("penjualanId", "==", penjualanId),
    );
    const detailSnap = await getDocs(detailQuery);
    const details: PenjualanDetail[] = [];

    for (const detailDoc of detailSnap.docs) {
      const detailData = detailDoc.data();
      const supplierProdukDoc = await getDoc(
        doc(db, "supplier_produk", detailData.supplierProdukId),
      );
      const supplierProdukData = supplierProdukDoc.data();

      if (supplierProdukData) {
        const produkDoc = await getDoc(
          doc(db, "produk", supplierProdukData.produkId),
        );
        const produkData = produkDoc.data();

        details.push({
          id: detailDoc.id,
          ...detailData,
          namaProduk: produkData?.nama || "Produk Tidak Ditemukan",
          satuan: produkData?.satuan || "",
          hargaJual: supplierProdukData.hargaJual || detailData.harga,
        } as PenjualanDetail);
      } else {
        details.push({
          id: detailDoc.id,
          ...detailData,
          namaProduk: "Produk Tidak Ditemukan",
          satuan: "",
          hargaJual: detailData.harga,
        } as PenjualanDetail);
      }
    }

    penjualanList.push({
      id: penjualanId,
      ...penjualanData,
      namaPelanggan: pelangganData?.namaPelanggan || "Unknown",
      alamatPelanggan: pelangganData?.alamat || "",
      items: details, // Add items for compatibility
      pajak: penjualanData.pajak || 0, // Ensure pajak field is included
    });
  }

  return penjualanList;
};

export const updatePenjualanStatus = async (
  id: string,
  status: "Lunas" | "Belum Lunas",
): Promise<void> => {
  const penjualanRef = doc(db, "penjualan", id);
  await updateDoc(penjualanRef, { status });
};

export const updatePenjualan = async (id: string, data: Partial<Penjualan>) => {
  // Use a transaction to handle stock updates when editing
  await runTransaction(db, async (transaction) => {
    const penjualanRef = doc(db, "penjualan", id);
    const penjualanDoc = await transaction.get(penjualanRef);

    if (!penjualanDoc.exists()) {
      throw new Error("Transaksi penjualan tidak ditemukan.");
    }

    const currentData = penjualanDoc.data() as Penjualan;

    // If items are being updated, handle stock adjustments
    if (data.items) {
      // First, read all product data for validation (all reads before writes)
      const produkReads: { [key: string]: any } = {};

      for (const item of data.items) {
        const supplierProdukRef = doc(
          db,
          "supplier_produk",
          item.supplierProdukId,
        );
        const supplierProdukDoc = await transaction.get(supplierProdukRef);

        if (!supplierProdukDoc.exists()) {
          throw new Error(`Produk supplier tidak ditemukan.`);
        }

        produkReads[item.supplierProdukId] = {
          ref: supplierProdukRef,
          data: supplierProdukDoc.data(),
          newQty: item.qty,
        };
      }

      // Validate stock for new items
      for (const item of data.items) {
        const produkInfo = produkReads[item.supplierProdukId];
        const currentStok = produkInfo.data.stok;
        if (currentStok < item.qty) {
          throw new Error(
            `Stok produk tidak mencukupi. Sisa stok: ${currentStok}`,
          );
        }
      }

      // Now do all writes: restore old stock, then deduct new stock
      for (const item of currentData.items || []) {
        const supplierProdukRef = doc(
          db,
          "supplier_produk",
          item.supplierProdukId,
        );
        transaction.update(supplierProdukRef, {
          stok: increment(item.qty),
        });
      }

      for (const item of data.items) {
        const supplierProdukRef = doc(
          db,
          "supplier_produk",
          item.supplierProdukId,
        );
        transaction.update(supplierProdukRef, {
          stok: increment(-item.qty),
        });
      }
    }

    // Update the penjualan document
    const updateData = { ...data };
    delete updateData.items; // Remove items from main document update
    transaction.update(penjualanRef, { ...updateData, updatedAt: new Date() });
  });
};

export const deletePenjualan = async (id: string) => {
  // Use a transaction to restore stock when deleting
  await runTransaction(db, async (transaction) => {
    const penjualanRef = doc(db, "penjualan", id);
    const penjualanDoc = await transaction.get(penjualanRef);

    if (!penjualanDoc.exists()) {
      throw new Error("Transaksi penjualan tidak ditemukan.");
    }

    const penjualanData = penjualanDoc.data() as Penjualan;

    // Restore stock for all items
    for (const item of penjualanData.items || []) {
      const supplierProdukRef = doc(
        db,
        "supplier_produk",
        item.supplierProdukId,
      );
      transaction.update(supplierProdukRef, {
        stok: increment(item.qty),
      });
    }

    // Delete the penjualan document
    transaction.delete(penjualanRef);
  });
};

export const generateInvoiceNumber = async (): Promise<string> => {
  const counterRef = doc(db, "counters", "penjualan");

  const next = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);

    if (!snap.exists()) {
      tx.set(counterRef, { lastNumber: 1 });
      return 1;
    }

    const nextNumber = snap.data().lastNumber + 1;
    tx.update(counterRef, { lastNumber: nextNumber });
    return nextNumber;
  });

  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `INV/${year}${month}${day}/${String(next).padStart(4, "0")}`;
};

export const generateSuratJalanNumber = async (): Promise<string> => {
  const counterRef = doc(db, "counters", "suratJalan");

  const next = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);

    if (!snap.exists()) {
      tx.set(counterRef, { lastNumber: 1 });
      return 1;
    }

    const nextNumber = snap.data().lastNumber + 1;
    tx.update(counterRef, { lastNumber: nextNumber });
    return nextNumber;
  });

  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `SJ/${year}${month}${day}/${String(next).padStart(4, "0")}`;
};
