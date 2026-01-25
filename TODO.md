# TODO: Implement Edit and Delete for Sales Transactions

## Current Status

- Edit and delete buttons exist in PenjualanTabel.tsx but functionality is not implemented
- handleEdit and handleCancel in page.tsx have TODO comments

## Tasks to Complete

### 1. Add Service Functions

- [ ] Add `updatePenjualan` function in penjualan.service.ts
- [ ] Add `deletePenjualan` function in penjualan.service.ts (with stock restoration)

### 2. Modify PenjualanForm for Editing

- [ ] Add `editingPenjualan` prop to PenjualanForm
- [ ] Modify form to populate data when editing
- [ ] Handle stock restoration when editing (return old quantities)
- [ ] Update submit logic for edit vs create

### 3. Update Page Component

- [ ] Implement handleEdit in page.tsx
- [ ] Implement handleCancel in page.tsx with stock restoration
- [ ] Add state for editing mode

### 4. Testing

- [ ] Test edit functionality
- [ ] Test delete functionality with stock restoration
- [ ] Verify stock levels are correctly managed
