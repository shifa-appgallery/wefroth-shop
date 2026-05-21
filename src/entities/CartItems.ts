// entities/CartItem.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { Cart } from "./Cart";
import { Product } from "./Product";
import { ProductVariant } from "./ProductVariant";

@Entity("cart_items")
export class CartItem {
  @PrimaryGeneratedColumn()
  cartItemId: number;

  @ManyToOne(() => Cart, (cart) => cart.items, {
    onDelete: "CASCADE",
  })
  cart: Cart;

  @ManyToOne(() => Product, {
    eager: true,
  })
  product: Product;

  @ManyToOne(() => ProductVariant, {
    nullable: true,
    eager: true,
  })
  variant: ProductVariant;

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