import { Order } from "../types/order";

export const getAllOrders = async (): Promise<Order[]> => {
  const res = await fetch("/api/orders");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getOrderById = async (id: string): Promise<Order> => {
  const res = await fetch(`/api/orders/${id}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const createOrder = async (
  items: Order["items"],
  userId: string,
  buyerName: string,
) => {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items,
      userId,
      buyerName, // ✅ INI YANG HILANG
    }),
  });

  if (!res.ok) throw new Error(await res.text());
};

export const updateOrder = async (id: string, items: Order["items"]) => {
  const res = await fetch(`/api/orders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });

  if (!res.ok) throw new Error(await res.text());
};

export const deleteOrder = async (id: string) => {
  const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
};
