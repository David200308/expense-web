import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from '../common/dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/user.decorator';
import { User } from '../entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('nonce/:walletAddress')
  @ApiOperation({ summary: 'Get nonce for wallet address' })
  @ApiParam({ name: 'walletAddress', description: 'Wallet address' })
  @ApiResponse({ status: 200, description: 'Nonce generated successfully' })
  async getNonce(@Param('walletAddress') walletAddress: string) {
    return this.authService.getNonce(walletAddress);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with wallet signature' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid signature' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Verify JWT token and get user info' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async verify(@GetUser() user: User) {
    return {
      id: user.id,
      walletAddress: user.walletAddress,
      currency: user.currency,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout() {
    // In a real application, you might want to blacklist the token
    return { message: 'Logged out successfully' };
  }
}
