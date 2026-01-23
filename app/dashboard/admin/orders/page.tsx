import OrderList from "@/components/order/OrderList";
import Link from "next/link";

export default function OrdersPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Link
          href="/dashboard/admin/orders/new"
          className="bg-black text-white px-4 py-2"
        >
          + Order
        </Link>
      </div>
      <OrderList />
    </div>
  );
}
