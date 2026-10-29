import { Inventory, InventoryType } from "@prisma/client";

export interface CreateInventoryParams {
  productVariantId: number;
  type: InventoryType;
  quantity: number;
  unitCost?: number | undefined;
  totalCost?: number | undefined;
}

export interface ListInventoriesParams {
  type: string;
  limit?: number | undefined;
  offset?: number | undefined;
  search?: string | undefined;
}

export type ExportInventoriesParams = Omit<ListInventoriesParams, "type"> & {
  type?: string | undefined;
};

export type InventoryCsvQueryDataT = Inventory & {
  productVariant: {
    id: number;
    sku: string;
    size: number;
    product: {
      id: number;
      name: string;
      brand: {
        name: string;
      };
    };
  };
  createdBy: {
    username: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null;
};

export type InventoryCsvRowT = {
  inventory_id: string;
  created_at: string;
  type: string;
  quantity: string;
  unit_cost: string;
  total_cost: string;
  variant_id: string;
  variant_name: string;
  sku: string;
  product_id: string;
  product_name: string;
  brand_name: string;
  created_by: string;
};

export interface ParseInventoryQueryParamsResult {
  pageSize: number;
  offset: number;
  search?: string | undefined;
  type: string;
}

export type ListInventoryT = Inventory & {
  productVariant: {
    id: number;
    sku: string;
    product: {
      id: number;
      name: string;
    };
  };
  createdBy: {
    id: number;
    username: string;
  } | null;
};

export type ListInventoryResultT = {
  items: ListInventoryT[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
};
