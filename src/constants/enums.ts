export enum SellerType {
  PLATFORM = "PLATFORM",
  TEAM = "TEAM",
  BRAND = "BRAND",
}

export enum OrderStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum TransactionType {
  SALE = "SALE",
  COMMISSION = "COMMISSION",
  REFUND = "REFUND",
  ADJUSTMENT = "ADJUSTMENT",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  SETTLED = "SETTLED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum CouponType {
  PERCENTAGE = "PERCENTAGE",
  FIXED = "FIXED",
  FLAT = "FLAT"
}

export enum MediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
}

// constants/enums.ts

export enum Gender {
  MALE = "MEN",
  FEMALE = "WOMEN",
  ALL = "ALL",
  KIDS = "KIDS"
}
export enum CategoryType {
  MEN = "MEN",
  WOMEN = "WOMEN",
  KIDS = "KIDS",
  ALL = "ALL",
}