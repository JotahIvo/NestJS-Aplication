import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/database/prisma.service';
import { SignInDto } from './dto/signIn.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  /**
   * Authenticates a user by validating their credentials.
   * @param params - The user's sign-in data, containing email and password.
   * @returns A promise that resolves to an object containing the access token.
   * @throws {NotFoundException} If no user is found with the provided email.
   * @throws {UnauthorizedException} If the provided password does not match the stored hash.
   */
  async signIn(
    signInDto: SignInDto,
  ): Promise<{ access_token: string }> {
    let user;
    try {
      user = await this.prisma.user.findUnique({
        where: { email: signInDto.email },
      });
    } catch (e) {

    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordMatch = await bcrypt.compare(signInDto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id };

    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
