"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";
import { getOrderById, updateOrder } from "@/app/services/order.service";

export default function EditOrderPage() {
  const { id } = useParams();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    getOrderById(id as string).then((o) => setItems(o.items));
  }, [id]);

  const save = async () => {
    await updateOrder(id as string, items);
    router.push("/orders");
  };

  return (
    <div className="p-6">
      <button onClick={save} className="bg-black text-white px-4 py-2">
        Simpan
      </button>
    </div>
  );
}
