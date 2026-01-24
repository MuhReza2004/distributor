import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  runTransaction,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Produk, ProdukFormData } from "../types/produk";

/* =============================
   AUTO GENERATE ID PRODUK
   ============================= */
export const generateProdukId = async (): Promise<string> => {
  const counterRef = doc(db, "counters", "produk");

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

  return `PRD-${String(next).padStart(5, "0")}`;
};

/* =============================
   AUTO GENERATE KODE PRODUK
   ============================= */
export const generateKodeProduk = async (): Promise<string> => {
  const counterRef = doc(db, "counters", "kodeProduk");

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

  return `SKU-${String(next).padStart(5, "0")}`;
};

export const getNewKodeProduk = async (): Promise<string> => {
  return await generateKodeProduk();
};

/* =============================
   CREATE
   ============================= */
export const addProduk = async (data: ProdukFormData): Promise<string> => {
  const generateProdukId = async (): Promise<string> => {
    const counterRef = doc(db, "counters", "produk");

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

    return `PRD-${String(next).padStart(5, "0")}`;
  };

  const idProduk = await generateProdukId();

  const ref = await addDoc(collection(db, "produk"), {
    ...data,
    idProduk,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
};

/* =============================
   READ
   ============================= */
export const getAllProduk = async (): Promise<Produk[]> => {
  const q = query(collection(db, "produk"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    idProduk: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate(),
    updatedAt: d.data().updatedAt?.toDate(),
  })) as Produk[];
};

export const getProdukById = async (id: string): Promise<Produk | null> => {
  const snap = await getDoc(doc(db, "produk", id));
  if (!snap.exists()) return null;

  return {
    idProduk: snap.id,
    ...snap.data(),
    createdAt: snap.data().createdAt?.toDate(),
    updatedAt: snap.data().updatedAt?.toDate(),
  } as Produk;
};

/* =============================
   UPDATE & DELETE
   ============================= */
export const updateProduk = async (
  id: string,
  data: Partial<ProdukFormData>,
): Promise<void> => {
  await updateDoc(doc(db, "produk", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteProduk = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "produk", id));
};
