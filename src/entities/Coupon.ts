// entities/Coupon.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { CouponType } from "../constants/enums";

@Entity("coupons")
export class Coupon {
  @PrimaryGeneratedColumn()
  couponId: number;

  @Column({ unique: true })
  code: string;

  @Column({
    type: "enum",
    enum: CouponType,
  })
  coupon_type: CouponType;

  @Column("decimal", {
    precision: 10,
    scale: 2,
  })
  discount_percentage: number;

  @Column("decimal", {
    precision: 10,
    scale: 2,
    default: 0,
  })
  minimum_order_amount: number;

  @Column({ nullable: true })
  description: string;

  @Column()
  expiry_date: Date;

  @Column({ default: 0 })
  usage_limit: number;

  @Column({ default: 0 })
  used_count: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  created_by: Number;

  @Column({ nullable: true })
  updated_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}