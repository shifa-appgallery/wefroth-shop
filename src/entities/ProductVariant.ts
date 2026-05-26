import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";

import { Product } from "./Product";
import { VariantImage } from "./VanriantImage";
import { Color } from "./Color";
import { Size } from "./Size";

@Entity("product_variants")
export class ProductVariant {
  @PrimaryGeneratedColumn()
  variantId: number;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: "CASCADE",
  })
  product: Product;

  @ManyToOne(() => Color, {
    eager: true,
    nullable: true,
  })
  color: Color | null;

  @ManyToOne(() => Size, {
    eager: true,
    nullable: true,
  })
  size: Size | null;

  @Column()
  name: string;

  @Column({ unique: true })
  sku: string;

  @Column("decimal", {
    precision: 10,
    scale: 2,
  })
  price: number;

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

  @Column({ default: 0 })
  stock: number;

  @OneToMany(
    () => VariantImage,
    (variantImage) => variantImage.variant,
    {
      cascade: true,
    }
  )
  variantImages: VariantImage[];

  @Column()
  created_by: number;

  @Column({ nullable: true })
  updated_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}