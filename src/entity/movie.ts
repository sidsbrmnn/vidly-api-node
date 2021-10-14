import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Genre } from './genre';
import { Rental } from './rental';

@Entity()
export class Movie extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  title!: string;

  @ManyToOne(() => Genre, (genre) => genre.movies, { cascade: false })
  genre!: Genre;

  @Column({ nullable: false })
  stock!: number;

  @Column({ nullable: false })
  rental_rate!: number;

  @OneToMany(() => Rental, (rental) => rental.movie)
  rentals!: Rental[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;
}
