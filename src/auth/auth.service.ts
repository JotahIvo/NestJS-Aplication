import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/database/prisma.service';

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
    params: Prisma.UserCreateInput,
  ): Promise<{ access_token: string }> {
    console.log('--- SIGN IN ATTEMPT ---');
    console.log('Attempting to sign in user:', params.email);

    let user;
    try {
      user = await this.prisma.user.findUnique({
        where: { email: params.email },
      });
    } catch (e) {

    }

    if (!user) {
      console.error('User not found for email:', params.email);
      throw new NotFoundException('User not found');
    }

    console.log('User found, checking password...');

    const passwordMatch = await bcrypt.compare(params.password, user.password);
    if (!passwordMatch) {
      console.warn('Invalid credentials for user:', user.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id };

    console.log('Login successful, generating token for payload:', payload);

    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
