import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Driver } from "src/driver/entities/driver.entity";
@Entity()
export class Car {
    @PrimaryGeneratedColumn()
    Idcar:number; // id Vécule
    @Column()
    TruckRegistration : string ; //Matricule de Camion 
    @Column()
    GrayCardNumber : string ; // numéro de carte grise 
    @Column()
    Brand :string ; // Marque 
    @Column()
    DateFirstRegistration : Date ; // mise en circulation  
    @Column()
    Mileage : number; // kilométrage 
    @Column()
    Oilchange : Date;
    @Column()
    RemainingMileage : string ; // nombre de kilométre restant
    @Column()
    Tonnage : number; // tonnage 
    @OneToOne(() => Driver, (driver) => driver.car)
    driver: Driver; // Relation avec Driv
}
