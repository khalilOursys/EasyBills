import { Bank } from "src/bank/entities/bank.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
@Entity()
export class BankOperation {
    @PrimaryGeneratedColumn()
    IdOperation : number ;
    @Column()
    bank : string ;
    @Column()
    DateOperation : Date ;
    @Column()
    Description: string ;
    @Column()
    PaymentReference : string ;
    @Column()
    Note : string;
    @Column()
    TypeOperation : String ; 
    @Column()
    OperationReference : string ;
    @Column()
    Amount : number;

    @ManyToOne(() => Bank, (Bank) => Bank.BankOperations)
    Bank: Bank; // Relation avec Bank
}
