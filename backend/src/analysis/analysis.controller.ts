import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { AnalysisService, AnalysisFilters } from './analysis.service'

@Controller('analysis')
@UseGuards(JwtAuthGuard)
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get('report')
  async getAnalysisReport(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy?: 'day' | 'month' | 'year',
  ) {
    const filters: AnalysisFilters = {
      userId: req.user.id,
      startDate,
      endDate,
      groupBy: groupBy || 'month',
    }

    return this.analysisService.generateAnalysisReport(filters)
  }

  @Get('categories')
  async getCategoryAnalysis(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: AnalysisFilters = {
      userId: req.user.id,
      startDate,
      endDate,
    }

    const report = await this.analysisService.generateAnalysisReport(filters)
    return {
      categories: report.categoryBreakdown,
      summary: report.summary,
    }
  }

  @Get('timeseries')
  async getTimeSeriesData(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy?: 'day' | 'month' | 'year',
  ) {
    const filters: AnalysisFilters = {
      userId: req.user.id,
      startDate,
      endDate,
      groupBy: groupBy || 'month',
    }

    const report = await this.analysisService.generateAnalysisReport(filters)
    return {
      timeSeries: report.timeSeriesData,
      summary: report.summary,
    }
  }
}
