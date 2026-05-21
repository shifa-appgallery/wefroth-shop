// entities/ShippingAddress.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("shipping_addresses")
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

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
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