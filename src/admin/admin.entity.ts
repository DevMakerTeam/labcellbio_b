
import {
  Entity,   
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'admin_users' }) 
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'username', length: 50, unique: true })
  username: string;

  @Column({ name: 'password', length: 255 })
  password: string;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;
}
