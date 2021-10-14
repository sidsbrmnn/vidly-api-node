import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from './customer';
import { Movie } from './movie';
import { Return } from './return';

@Entity()
export class Rental extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Customer, (customer) => customer.rentals)
  customer!: Customer;

  @ManyToOne(() => Movie, (movie) => movie.rentals)
  movie!: Movie;

  @OneToOne(() => Return, (ret) => ret.rental)
  'return': Return;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;
}
