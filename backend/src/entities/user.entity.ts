import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Expense } from './expense.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 42 })
  walletAddress: string;

  @Column({ default: 'USD', length: 3 })
  currency: string;

  @Column({ nullable: true, length: 255 })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Expense, expense => expense.user)
  expenses: Expense[];
}
