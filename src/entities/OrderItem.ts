import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { Order } from "./Order";
import { Product } from "./Product";

import { ProductVariant } from "./ProductVariant";
import { SellerType } from "../constants/enums";

@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn()
  orderItemId: number;

  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: "CASCADE",
  })
  order: Order;

  @ManyToOne(() => Product)
  product: Product;

  @ManyToOne(() => ProductVariant, {
    nullable: true,
  })
  variant: ProductVariant;

  @Column({
    type: "enum",
    enum: SellerType,
    nullable: true
  })
  seller_type: SellerType;

  @Column("int", { nullable: true })
  seller_id: string;

  @Column()
  quantity: number;

  @Column("decimal", {
    precision: 10,
    scale: 2,
  })
  unit_price: number;

  @Column("decimal", {
    precision: 10,
    scale: 2,
  })
  total_price: number;

  @Column("decimal", {
    precision: 10,
    scale: 2,
    default: 0,
  })
  commission_amount: number;

  @Column()
  created_by: number;

  @Column({ nullable: true })
  updated_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}