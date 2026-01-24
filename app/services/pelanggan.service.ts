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
import { Pelanggan, PelangganFormData } from "../types/pelanggan";

/* =============================
   AUTO GENERATE ID PELANGGAN
   ============================= */
const generatePelangganId = async (): Promise<string> => {
  const counterRef = doc(db, "counters", "pelanggan");

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

  return `PLG-${String(next).padStart(5, "0")}`;
};

/* =============================
   AUTO GENERATE KODE PELANGGAN
   ============================= */
export const generateKodePelanggan = async (): Promise<string> => {
  const counterRef = doc(db, "counters", "kodePelanggan");

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

  return `PLG-${String(next).padStart(5, "0")}`;
};

export const getNewKodePelanggan = async (): Promise<string> => {
  return await generateKodePelanggan();
};
export const addpelanggan = async (
  data: PelangganFormData,
): Promise<string> => {
  const idPelanggan = await generatePelangganId();

  const ref = await addDoc(collection(db, "pelanggan"), {
    ...data,
    idPelanggan,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
};

/* =============================
   READ
   ============================= */
export const getAllPelanggan = async (): Promise<Pelanggan[]> => {
  const q = query(collection(db, "pelanggan"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    idPelanggan: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate(),
    updatedAt: d.data().updatedAt?.toDate(),
  })) as Pelanggan[];
};

export const getPelangganById = async (
  id: string,
): Promise<Pelanggan | null> => {
  const snap = await getDoc(doc(db, "pelanggan", id));
  if (!snap.exists()) return null;

  return {
    idPelanggan: snap.id,
    ...snap.data(),
    createdAt: snap.data().createdAt?.toDate(),
    updatedAt: snap.data().updatedAt?.toDate(),
  } as Pelanggan;
};

/* =============================
   UPDATE & DELETE
   ============================= */
export const updatePelanggan = async (
  id: string,
  data: Partial<PelangganFormData>,
): Promise<void> => {
  await updateDoc(doc(db, "pelanggan", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deletePelanggan = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "pelanggan", id));
};
