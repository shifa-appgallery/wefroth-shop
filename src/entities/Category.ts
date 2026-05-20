import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { CategoryType } from "../constants/enums";

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn()
  categoryId: number;

  @Column()
  categoryName: string;

  @Column({ nullable: true })
  categoryIcon: string;

  @Column({ unique: true })
  slug: string;

  @Column({ default: 1 })
  level: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: 0 })
  sort_order: number;

  @Column({
    type: "enum",
    enum: CategoryType,
    default: CategoryType.ALL,
  })
  type: CategoryType;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  created_by: number;

  @Column({ nullable: true })
  updated_by: number;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
  })
  @JoinColumn({ name: "parentCategoryId" })
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];
}