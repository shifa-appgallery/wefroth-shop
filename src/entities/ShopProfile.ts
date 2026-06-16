import { Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { SellerType } from "../constants/enums";

@Entity()
@Unique(["profileId"])
export class ShopProfile {
  @PrimaryGeneratedColumn()
  shopProfileId: number;

  @Column({
    type: "enum",
    enum: SellerType,
  })
  seller_type: SellerType;

  @Column("int", { nullable: true })
  seller_id: number;

  @Column("int", { nullable: true })
  profileId: number;

  @Column()
  display_name: string;

  @Column({ nullable: true })
  banner_url: string;

  @Column({ nullable: true })
  logo_url: string;

  @Column({ nullable: true })
  theme_color: string;

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