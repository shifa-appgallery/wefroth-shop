// entities/ShippingAddress.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";

@Entity("shipping_addresses")

@Unique("unique_shipping_address", [
  "user_id",
  "full_name",
  "mobile_number",
  "address_line_1",
  "address_line_2",
  "city",
  "state",
  "country",
  "postal_code",
  "emailId"
])
export class ShippingAddress {
  @PrimaryGeneratedColumn()
  shippingAddressId: number;

  @Column("int")
  user_id: number;

  @Column()
  full_name: string;

  @Column()
  mobile_number: string;

  @Column()
  address_line_1: string;

  @Column({ nullable: true })
  address_line_2: string;

  @Column({ nullable: true })
  emailId: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column()
  postal_code: string;

  @Column({ default: false })
  is_default: boolean;

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