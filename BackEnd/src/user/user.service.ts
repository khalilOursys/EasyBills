import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity/user.entity';
import { Role } from 'src/role/entities/role.entity'; // Make sure to import the Role entity

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>, // Inject RoleRepository to manage roles
  ) {}

  async onModuleInit() {
    const users = await this.userRepository.find();
    if (users.length === 0) {
      // Check if the role with id 1 exists
      let role = await this.roleRepository.findOne({ where: { id: 1 } });

      // If the role doesn't exist, create it
      if (!role) {
        role = await this.roleRepository.save({
          id: 1,
          name: 'Admin', // Specify a role name or other properties here
        });
      }

      const hashedPassword = await bcrypt.hash('123', 10);
      await this.userRepository.save([
        {
          id: 1,
          name: 'feriani khalil',
          email: 'feriani.khalil.oursys@gmail.com',
          role,
          password: hashedPassword,
        },
      ]);
    }
  }

  // Create a new user with hashed password and assigned role
  async createUser(
    name: string,
    email: string,
    password: string,
    tel: string,
    roleId: number, // Accept roleId to assign a role
  ): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Fetch the role based on roleId
    const role = await this.roleRepository.findOne({ where: { id: roleId } });

    if (!role) {
      throw new NotFoundException('Role not found'); // Handle case where role doesn't exist
    }

    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      tel,
      role, // Assign the fetched role to the user
    });

    return this.userRepository.save(user);
  }

  // Find a user by email
  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findUserByEmailAndRole(
    email: string,
    idRole: number,
  ): Promise<User | null> {
    return await this.userRepository.findOne({
      where: {
        email: email,
        role: { id: idRole }, // Assuming role is the relation and we are referencing its id
      },
    });
  }

  // Validate user password
  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Remove a user by ID
  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.remove(user);
  }

  // Get all users
  async findAll(): Promise<User[]> {
    return await this.userRepository.find({ relations: ['role'] });
  }

  async updateUser(userId: number, updateData: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (updateData.password === '') {
      updateData.password = user.password;
    } else if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    Object.assign(user, updateData);
    await this.userRepository.save(user);

    return user;
  }
}
