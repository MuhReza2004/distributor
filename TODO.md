# TODO: Change Supplier Collection Structure

## Overview

Change the supplier collection to store supplier name, product IDs (referencing produk collection), and address. Display product names in forms and table by fetching from produk collection.

## Steps

- [x] Update types/suplyer.ts: Change SupplierFormData to use productIds: string[] instead of products: SupplierProduct[]. Adjust SupplierProduct if needed.
- [x] Update app/services/supplyer.service.ts: Modify CRUD functions to store/fetch productIds. Add join in getAllSuppliers to fetch product names from produk collection.
- [x] Update components/suplyer/DialogTambahSuplyer.tsx: Fetch all products, use select dropdown for product selection by name, store IDs.
- [x] Update components/suplyer/EditSupplierDialog.tsx: Similarly, use select dropdown for products.
- [x] Update components/suplyer/TabelSuplyer.tsx: Display product names by fetching via IDs.
- [ ] Test the changes: Ensure forms and table work correctly with new structure.
