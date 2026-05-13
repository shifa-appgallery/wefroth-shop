import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { OrderItem } from "./OrderItem";
import { OrderStatus, PaymentStatus } from "../constants/enums";


@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn("uuid")
  orderId: string;

  @Column("uuid")
  user_id: string;

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

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  @Column()
  created_by: number;

  @Column({ nullable: true })
  updated_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

}