import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Rental } from './rental';

@Entity()
export class Customer extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  name!: string;

  @Column({ nullable: false })
  email!: string;

  @Column({ nullable: false })
  phone!: string;

  @OneToMany(() => Rental, (rental) => rental.customer)
  rentals!: Rental[];
}
