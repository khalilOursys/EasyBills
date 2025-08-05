import { User } from 'src/user/entities/user.entity/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.notification)
  owner: User;

  @Column({ nullable: true })
  msg: string;

  @Column({ nullable: true })
  location: string;

  @Column({ default: 0 })
  read: number;
}
