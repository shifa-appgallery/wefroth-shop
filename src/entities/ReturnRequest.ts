import { Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { OrderItem } from "./OrderItem";
import { Order } from "./Order";
import { ReturnStatus } from "../constants/enums";

@Entity("return_requests")
export class ReturnRequest {

    @PrimaryGeneratedColumn()
    returnRequestId: number;

    @ManyToOne(() => Order)
    order: Order;

    @ManyToOne(() => OrderItem)
    orderItem: OrderItem;

    @Column()
    user_id: number;

    @Column()
    seller_id: number;

    @Column()
    reason: string;

    @Column({ nullable: true })
    description: string;

    @Column("simple-array", { nullable: true })
    images: string[];

    @Column({
        type: "enum",
        enum: ReturnStatus,
        default: ReturnStatus.REQUESTED
    })
    status: ReturnStatus;

    @Column({ nullable: true })
    seller_comment: string;

    @Column({ nullable: true })
    courier_name: string;

    @Column({ nullable: true })
    tracking_number: string;

    @Column({ nullable: true })
    refunded_transaction_id: number;

    @Column("decimal", {
        precision: 10,
        scale: 2,
        nullable: true,
    })
    amount: number;

    @Column({
        type: "timestamp",
        nullable: true,
    })
    refunded_at: Date;

    @Column({
        nullable: true,
    })
    refund_mode: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}