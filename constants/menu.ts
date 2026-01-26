import { UserRole } from "@/app/types/user";

export interface MenuItem {
  label: string;
  href: string;
  roles: UserRole[];
  children?: MenuItem[];
}

export const dashboardMenus: MenuItem[] = [
  // ADMIN
  {
    label: "Dashboard",
    href: "/dashboard/admin",
    roles: ["admin"],
  },
  {
    label: "Produk",
    href: "/dashboard/admin/produk",
    roles: ["admin"],
  },
  {
    label: "Supplier",
    href: "/dashboard/admin/supplyer",
    roles: ["admin"],
  },
  {
    label: "Harga Produk",
    href: "/dashboard/admin/HargaProduk",
    roles: ["admin"],
  },
  {
    label: "Pelanggan",
    href: "/dashboard/admin/pelanggan",
    roles: ["admin"],
  },
  {
    label: "Inventory/stok",
    href: "/dashboard/admin/inventory",
    roles: ["admin"],
  },
  {
    label: "Transaksi",
    href: "/dashboard/admin/transaksi",
    roles: ["admin"],
    children: [
      {
        label: "Pembelian",
        href: "/dashboard/admin/transaksi/pembelian",
        roles: ["admin"],
      },
      {
        label: "Penjualan",
        href: "/dashboard/admin/transaksi/penjualan",
        roles: ["admin"],
      },
    ],
  },
  // {
  //   label: "Penjualan",
  //   href: "/dashboard/admin/orders",
  //   roles: ["admin"],
  // },

  // {
  //   label: "Invoice",
  //   href: "/dashboard/admin/invoice",
  //   roles: ["admin"],
  // },

  // STAFF
  {
    label: "Dashboard",
    href: "/dashboard/staff",
    roles: ["staff"],
  },
  {
    label: "Input Barang",
    href: "/dashboard/staff/input",
    roles: ["staff"],
  },
];
