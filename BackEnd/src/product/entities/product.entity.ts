import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Category } from 'src/category/entities/category.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  productCode: string;

  @Column({ nullable: true })
  designation: string;

  @Column({ nullable: true, type: 'float' })
  purchasePriceExclVat: number; //prix achat HT

  @Column({ nullable: true, type: 'float' })
  purchasePriceInclVat: number; //prix achat TVA

  @Column({ nullable: true, type: 'float' })
  vat: number;

  @Column({ nullable: true, type: 'float' })
  salePriceExclVat: number; //prix vente HT

  @Column({ nullable: true, type: 'float' })
  salePriceInclVat: number; //prix vente TVA

  @Column({ nullable: true, type: 'float' })
  margin: number;

  @Column({ nullable: true, type: 'float' })
  discount: number;

  @Column({ nullable: true })
  stock: number;

  @Column({ nullable: true })
  safetyStock: number;

  @Column({ nullable: true })
  packaging: number;

  @Column({ nullable: true })
  weight: number;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  photo: string;

  /* @ManyToOne(() => Category, (category) => category.products)
  category: Category; */
}
