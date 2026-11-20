import {
  CreateInventoryParams,
  ExportInventoriesParams,
  ListInventoriesParams,
  ListInventoryResultT,
} from "../../types/inventory";
import { ServiceResponseT } from "../../types/common";

export interface IAdminInventoryService {
  listInventories(params: ListInventoriesParams): Promise<ServiceResponseT<ListInventoryResultT>>;
  exportInventories(params: ExportInventoriesParams): Promise<string>;
  createInventory(params: CreateInventoryParams & { createdById?: number }): Promise<ServiceResponseT<null>>;
}
