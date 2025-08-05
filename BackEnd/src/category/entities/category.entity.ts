import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "src/product/entities/product.entity";
@Entity()
export class Category {
@PrimaryGeneratedColumn()
id:number;
@Column()
Description : string ;

// Relation One-to-Many avec Product
  // Relation One-to-Many avec Product
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
