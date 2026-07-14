// entities/ShippingAddress.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";
import { AddressType } from "../constants/enums";

@Entity("shipping_addresses")

@Unique("unique_shipping_address", [
  "user_id",
  "address_type",
  "full_name",
  "mobile_number",
  "address",
  "city",
  "state",
  "country",
  "country_code",
  "postal_code",
  "emailId",
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

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  emailId: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  country_code: string;

  @Column({
    type: "enum",
    enum: AddressType,
    nullable: true
  })
  address_type: AddressType;

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