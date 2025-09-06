import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional, Min, Length } from 'class-validator';

export class CreateExpenseDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  description: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  category: string;

  @IsDateString()
  date: string;
}

export class UpdateExpenseDto {
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  description?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  category?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
