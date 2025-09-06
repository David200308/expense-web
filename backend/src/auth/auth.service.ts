import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';
import { User } from '../entities/user.entity';
import { LoginDto } from '../common/dto/login.dto';
import { AuthResponse, JwtPayload } from '../common/interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async getNonce(walletAddress: string): Promise<{ nonce: string }> {
    // Generate a random nonce
    const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // In a real application, you might want to store this nonce temporarily
    // and verify it hasn't been used before
    return { nonce };
  }

  async validateSignature(loginDto: LoginDto): Promise<boolean> {
    try {
      const { walletAddress, signature, message } = loginDto;
      
      // Recover the address from the signature
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      // Check if the recovered address matches the provided wallet address
      return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
    } catch (error) {
      return false;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    // Validate the signature
    const isValidSignature = await this.validateSignature(loginDto);
    if (!isValidSignature) {
      throw new UnauthorizedException('Invalid signature');
    }

    const { walletAddress } = loginDto;

    // Find or create user
    let user = await this.userRepository.findOne({
      where: { walletAddress: walletAddress.toLowerCase() }
    });

    if (!user) {
      // Create new user
      user = this.userRepository.create({
        walletAddress: walletAddress.toLowerCase(),
        currency: 'USD', // Default currency
      });
      user = await this.userRepository.save(user);
    }

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      walletAddress: user.walletAddress,
    };

    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        currency: user.currency,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async verifyToken(token: string): Promise<User> {
    try {
      const payload = this.jwtService.verify(token) as JwtPayload;
      return await this.validateUser(payload);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
