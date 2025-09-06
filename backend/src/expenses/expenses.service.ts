import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from '../entities/expense.entity';
import { User } from '../entities/user.entity';
import { CreateExpenseDto, UpdateExpenseDto } from '../common/dto/expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto, userId: string): Promise<Expense> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const expense = this.expenseRepository.create({
      ...createExpenseDto,
      userId,
      date: new Date(createExpenseDto.date),
    });

    return this.expenseRepository.save(expense);
  }

  async findAll(userId: string): Promise<Expense[]> {
    return this.expenseRepository.find({
      where: { userId },
      order: { date: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({
      where: { id, userId },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto, userId: string): Promise<Expense> {
    const expense = await this.findOne(id, userId);

    const updateData: any = {
      ...updateExpenseDto,
    };

    if (updateExpenseDto.date) {
      updateData.date = new Date(updateExpenseDto.date);
    }

    await this.expenseRepository.update(id, updateData);
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const expense = await this.findOne(id, userId);
    await this.expenseRepository.remove(expense);
  }
}
