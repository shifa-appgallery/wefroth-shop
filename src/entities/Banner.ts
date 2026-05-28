import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("banners")
export class Banner {

  @PrimaryGeneratedColumn()
  bannerId: number;

  @Column()
  image_url: string;

  @Column({
    default: true,
  })
  is_active: boolean;

  @Column({
    nullable: true,
  })
  created_by: number;

  @Column({
    nullable: true,
  })
  updated_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}