// src/entities/VariantImage.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { ProductVariant } from "./ProductVariant";

@Entity("variant_images")
export class VariantImage {
  @PrimaryGeneratedColumn()
  variantImageId: number;

  @ManyToOne(
    () => ProductVariant,
    (variant) => variant.variantImages,
    {
      onDelete: "CASCADE",
    }
  )
  variant: ProductVariant;

  @Column()
  image_url: string;

  @Column({ nullable: true })
  alt_text: string;

  @Column({ default: true })
  is_active: boolean;

  @Column()
  created_by: number;

  @Column({ nullable: true })
  updated_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}