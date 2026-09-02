import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
}

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async create(data: CreateUserData): Promise<User> {
    const user = this.repository.create({ ...data, isActive: true });
    return this.repository.save(user);
  }
}
