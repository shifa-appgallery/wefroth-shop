// entities/Transaction.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { Order } from "./Order";

import {
  SellerType,
  TransactionType,
  TransactionStatus,
} from "../constants/enums";

@Entity("transactions")
export class Transaction {
  @PrimaryGeneratedColumn()
  transactionId: number;

  @Column({
    type: "enum",
    enum: SellerType,
  })
  seller_type: SellerType;

  @Column("int", { nullable: true })
  seller_id: string;

  @ManyToOne(() => Order, (order) => order.transactions, {
    nullable: true,
    onDelete: "SET NULL",
  })
  order: Order;

  @Column({
    type: "enum",
    enum: TransactionType,
  })
  transaction_type: TransactionType;

  @Column({
    nullable: true,
  })
  transaction_reference: string;

  @Column({
    nullable: true,
  })
  payment_gateway: string;

  @Column({
    nullable: true,
  })
  payment_method: string;

  @Column("decimal", {
    precision: 10,
    scale: 2,
  })
  amount: number;

  @Column({
    type: "enum",
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  transaction_status: TransactionStatus;

  @Column({
    type: "jsonb",
    nullable: true,
  })
  gateway_response: Record<string, any>;

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