import {
  csvValue,
  decimalValue,
  orderItemsValue,
} from "../services/order/order.helpers";
import {
  ListOrderT,
  MyOrderT,
  OrderCardQueryDataT,
  OrderCsvRowT,
} from "../types/order";

export class OrderDto {
  static toOrderCard(order: OrderCardQueryDataT): MyOrderT {
    return {
      id: order.id,
      code: order.code,
      image: order.image,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      totalPrice: order.totalPrice,
      customerAddress: order.customerAddress,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerNotes: order.customerNotes,
      cancelledReason: order.cancelledReason,
      rejectedReason: order.rejectedReason,
      totalPaidAmount: order.totalPaidAmount || 0,
      totalRefundAmount: order.totalRefundAmount || 0,
      orderItems: order.orderItems.map((item) => {
        return {
          quantity: item.quantity,
          price: item.price,
          size: item.productVariant.size,
          image: item.productVariant.images[0]?.path || null,
          product: {
            id: item.productVariant.product.id,
            slug: item.productVariant.product.slug,
            name: item.productVariant.product.name,
            brand: item.productVariant.product.brand.name,
          },
        };
      }),
    };
  }

  static toOrderCsvRow(order: ListOrderT): OrderCsvRowT {
    return {
      order_code: csvValue(order.code),
      created_at: order.createdAt.toISOString(),
      customer_name: csvValue(
        order.customerName ||
          [order.user.firstName, order.user.lastName]
            .filter(Boolean)
            .join(" ") ||
          order.user.username,
      ),
      customer_phone: csvValue(order.customerPhone || order.user.phone),
      customer_email: csvValue(order.user.email),
      customer_address: csvValue(order.customerAddress),
      customer_notes: csvValue(order.customerNotes),
      order_status: csvValue(order.status),
      payment_status: csvValue(order.paymentStatus),
      source: csvValue(order.source),
      total_price: decimalValue(order.totalPrice),
      order_items: csvValue(orderItemsValue(order)),
    };
  }
}
