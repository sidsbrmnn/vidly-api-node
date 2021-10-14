import jwt from 'jsonwebtoken';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  name!: string;

  @Column({ nullable: false, unique: true })
  email!: string;

  @Column({ nullable: false })
  password!: string;

  @Column({ nullable: false, enum: ['user', 'admin'], default: 'user' })
  role!: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  public generateToken() {
    return jwt.sign(
      { name: this.name, scope: '' },
      process.env.JWT_SECRET || 'shh-secret',
      { subject: this.id.toString() }
    );
  }
}
