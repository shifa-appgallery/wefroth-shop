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
import { ProductVariant } from "./ProductVariant";
import { ProductMedia } from "./ProductMedia";
import { Gender } from "./Gender";
import { ProductReview } from "./ProductReview";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  productId: number;

  @Column()
  productName: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({
    type: "enum",
    enum: SellerType,
  })
  seller_type: SellerType;

  // ADD THIS
  @Column("int", { nullable: true })
  teamId: number;

  @ManyToOne(() => Category)
  category: Category;

  @Column("decimal", {
    precision: 10,
    scale: 2,
  })
  base_price: number;

  @Column("decimal", {
    precision: 10,
    scale: 2,
    default: 0,
  })
  discount_value: number;

  @Column("decimal", {
    precision: 10,
    scale: 2,
    nullable: true,
  })
  discounted_price: number;

  @ManyToOne(() => Gender, {
    eager: true,
  })
  gender: Gender;
  @Column({ default: "AUD" })
  currency: string;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants: ProductVariant[];

  @OneToMany(() => ProductMedia, (media) => media.product)
  media: ProductMedia[];

  @OneToMany(
    () => ProductReview,
    (review) => review.product
  )
  reviews: ProductReview[];

  @Column()
  created_by: number;

  @Column({ nullable: true })
  updated_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}