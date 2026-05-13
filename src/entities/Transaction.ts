import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Order } from "./Order";
import { SellerType, TransactionType } from "../constants/enums";

export enum TransactionStatus {
  PENDING = "PENDING",
  SETTLED = "SETTLED",
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: SellerType,
  })
  seller_type!: SellerType;

  @Column("uuid")
  seller_id: string;

  @ManyToOne(() => Order, (order) => order.orderId, {
    nullable: true,
    onDelete: "SET NULL",
  })
  order!: Order;

  @Column({
    type: "enum",
    enum: TransactionType,
  })
  type: TransactionType;

  @Column("decimal", { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: "enum",
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column()
  created_by: number;

  @Column({ nullable: true })
  updated_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}