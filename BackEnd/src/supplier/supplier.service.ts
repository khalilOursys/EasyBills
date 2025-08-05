// supplier.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { Supplier } from './entities/supplier.entity';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
  ) {}

  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    const newSupplier = this.supplierRepository.create(createSupplierDto);
    return this.supplierRepository.save(newSupplier);
  }

  async findAll(): Promise<Supplier[]> {
    return this.supplierRepository.find();
  }

  async findOne(id: number): Promise<Supplier> {
    return this.supplierRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updateData: Partial<CreateSupplierDto>,
  ): Promise<Supplier> {
    await this.supplierRepository.update(id, updateData);
    return this.supplierRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.supplierRepository.delete(id);
  }
}
