// entities/Wishlist.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { Product } from "./Product";

@Entity("wishlist")
export class Wishlist {
  @PrimaryGeneratedColumn()
  wishlistId: number;

  @Column("int")
  user_id: string;

  @ManyToOne(() => Product, {
    onDelete: "CASCADE",
  })
  product: Product;

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