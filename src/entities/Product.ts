import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { Category } from "./Category";
import { SellerType } from "../constants/enums";
import { ProductVariant } from "./ProductVarient";
import { ProductImage } from "./ProductImage";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  productId: string;

  @Column()
  productName: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({
    type: "enum",
    enum: SellerType,
  })
  seller_type: SellerType;

  @Column("int")
  seller_id: number;

  @ManyToOne(() => Category)
  category: Category;

  @Column("decimal", {
    precision: 10,
    scale: 2,
  })
  base_price: number;

  @Column({ default: "AUD" })
  currency: string;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants: ProductVariant[];

  @OneToMany(() => ProductImage, (image) => image.product)
  images: ProductImage[];

  @Column()
  created_by: number;

  @Column({ nullable: true })
  updated_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}