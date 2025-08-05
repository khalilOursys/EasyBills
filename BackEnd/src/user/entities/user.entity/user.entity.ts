import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Role } from 'src/role/entities/role.entity';
import { Notification } from 'src/notification/entities/notification.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number; // The user ID field

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  tel: string;

  @Column()
  password: string;

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  role: Role;

  @OneToMany(() => Notification, (notification) => notification.owner)
  notification: Notification;
}
