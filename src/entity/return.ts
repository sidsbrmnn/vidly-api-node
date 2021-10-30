import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Rental } from './rental';

@Entity()
export class Return extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => Rental, (rental) => rental.return)
  rental!: Rental;

  @Column({ nullable: false })
  fee!: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;
}
