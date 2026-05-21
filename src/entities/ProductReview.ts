// entities/ProductReview.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { Product } from "./Product";

@Entity("product_reviews")
export class ProductReview {
  @PrimaryGeneratedColumn("uuid")
  reviewId: string;

  @ManyToOne(() => Product, {
    onDelete: "CASCADE",
  })
  product: Product;

  @Column("int")
  user_id: string;

  @Column({
    type: "int",
  })
  rating: number;

  @Column({
    type: "text",
    nullable: true,
  })
  review: string;

  @Column({ default: true })
  is_approved: boolean;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  created_by: number;

  @Column({ nullable: true })
  updated_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}