import { BankOperation } from "src/bankoperation/entities/bank-operation.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
@Entity()
export class Bank {
    @PrimaryGeneratedColumn()
    Idbank : number ;
    @Column()
    NameBank :String ;
    @Column()
    Agence : string ;
    @Column()
    Adress : string ;
    @Column()
    RIB : String ;

    @OneToMany(() => BankOperation, (BankOperations) => BankOperations.Bank)
    BankOperations: BankOperation[]; // Relation avec OperationBank
}
