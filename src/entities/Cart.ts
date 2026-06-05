// entities/Cart.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { CartItem } from "./CartItems";


@Entity("cart")
export class Cart {
  @PrimaryGeneratedColumn()
  cartId: number;

  @Column("int")
  user_id: number;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => CartItem, (item) => item.cart)
  items: CartItem[];

  @Column({ nullable: true })
  created_by: number;

  @Column({ nullable: true })
  updated_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}