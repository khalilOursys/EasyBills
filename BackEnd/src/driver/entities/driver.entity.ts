import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Car } from "src/car/entities/car.entity";
@Entity()
export class Driver {

@PrimaryGeneratedColumn()
IDdriver : number ; // id Chauffeur 
@Column()
Drivercode : string ; // code de Chauffeur
@Column()
name : string ; // nom de chauffeur 
@Column()
Firstname : string; // Prénom de chauffeur 
@Column()
CIN:string; // Numéro de Carte d'identité
@Column()
Drivinglicence:string; // 
@Column()
Dateacquisition : Date;
@Column()
Dateexpiration:Date;
@OneToOne(() => Car, (car) => car.driver, { cascade: true })
@JoinColumn() // Spécifie que cette colonne contient la clé étrangère
car: Car; // Relation avec Car
}
