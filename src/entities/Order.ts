// entities/Order.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { OrderItem } from "./OrderItem";
import { ShippingAddress } from "./ShippingAddress";
import { Coupon } from "./Coupon";
import { Transaction } from "./Transaction";

import {
  OrderStatus,
  PaymentStatus,
} from "../constants/enums";
import { Cart } from "./Cart";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn()
  orderId: number;

  @Column("int")
  user_id: number;

  @Column({
    unique: true,
  })
  order_number: string;

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  order_status: OrderStatus;

  @Column({
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  payment_status: PaymentStatus;

  @ManyToOne(() => ShippingAddress, {
    nullable: true,
    eager: true,
  })
  shipping_address: ShippingAddress;

  @ManyToOne(() => Coupon, {
    nullable: true,
    eager: true,
  })
  coupon: Coupon;

  @Column("decimal", {
    precision: 10,
    scale: 2,
  })
  subtotal: number;

  @Column("decimal", {
    precision: 10,
    scale: 2,
    default: 0,
  })
  discount_amount: number;

  @Column("decimal", {
    precision: 10,
    scale: 2,
    default: 0,
  })
  shipping_amount: number;

  @Column("decimal", {
    precision: 10,
    scale: 2,
    default: 0,
  })
  tax_amount: number;

  @Column("decimal", {
    precision: 10,
    scale: 2,
  })
  total_amount: number;

  @Column({
    nullable: true,
  })
  payment_method: string;

  @Column({
    nullable: true,
  })
  notes: string;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
  })
  items: OrderItem[];

  @ManyToOne(() => Cart, {
    eager: true,
  })
  cart: Cart;

  @OneToMany(() => Transaction, (transaction) => transaction.order)
  transactions: Transaction[];

  @Column({ default: true })
  is_active: boolean;

  @Column()
  created_by: number;

  @Column({ nullable: true })
  updated_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}