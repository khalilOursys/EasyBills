import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Supplier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  email: string;

  @Column()
  phoneNumber: string;

  @Column()
  coursDevis: string;

  @Column()
  matriculeFiscale: string;
}
