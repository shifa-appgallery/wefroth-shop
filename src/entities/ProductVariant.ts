import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { Product } from "./Product";

@Entity("product_variants")
export class ProductVariant {
  @PrimaryGeneratedColumn("uuid")
  variantId: string;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: "CASCADE",
  })
  product: Product;

  @Column()
  name: string;

  @Column({ unique: true })
  sku: string;

  @Column("decimal", {
    precision: 10,
    scale: 2,
  })
  price: number;

  @Column({ default: 0 })
  stock: number;

  @Column({
    type: "jsonb",
    nullable: true,
  })
  attributes: Record<string, any>;

  @Column()
  created_by: number;

  @Column({ nullable: true })
  updated_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}