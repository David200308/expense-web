import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AnalysisController } from './analysis.controller'
import { AnalysisService } from './analysis.service'
import { Expense } from '../entities/expense.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Expense])],
  controllers: [AnalysisController],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
