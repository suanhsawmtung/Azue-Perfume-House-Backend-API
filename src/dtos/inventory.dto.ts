import { csvValue, decimalValue } from "../services/order/order.helpers";
import { InventoryCsvQueryDataT, InventoryCsvRowT } from "../types/inventory";

export class InventoryDto {
  static toInventoryCsvRow(
    inventory: InventoryCsvQueryDataT,
  ): InventoryCsvRowT {
    const creatorName = inventory.createdBy
      ? [
          inventory.createdBy.firstName,
          inventory.createdBy.lastName,
        ].filter(Boolean).join(" ") || inventory.createdBy.username
      : "";

    return {
      inventory_id: String(inventory.id),
      created_at: inventory.createdAt.toISOString(),
      type: csvValue(inventory.type),
      quantity: String(inventory.quantity),
      unit_cost: decimalValue(inventory.unitCost),
      total_cost: decimalValue(inventory.totalCost),
      variant_id: String(inventory.productVariant.id),
      variant_name: csvValue(
        `${inventory.productVariant.product.name} - ${inventory.productVariant.size}ml`,
      ),
      sku: csvValue(inventory.productVariant.sku),
      product_id: String(inventory.productVariant.product.id),
      product_name: csvValue(inventory.productVariant.product.name),
      brand_name: csvValue(inventory.productVariant.product.brand.name),
      created_by: csvValue(creatorName),
    };
  }
}
