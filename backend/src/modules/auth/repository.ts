import prisma from '../../lib/prisma';
import { hashPassword, verifyPassword } from '../../lib/auth';
import {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken as storeRefreshTokenInDb,
  validateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  hashRefreshToken,
} from '../../lib/auth';
import { RegisterDto, UserPublic, TokenPayload, RefreshTokenData, AuthTokens, RequestMetadata } from './dto';
import logger from '../../config/logger';

/**
 * User Repository
 * Handles user-related database operations
 */
export class UserRepository {
  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  /**
   * Find user by ID
   */
  async findById(userId: string): Promise<UserPublic | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isVerified: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Check if user exists by email
   */
  async existsByEmail(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    return !!user;
  }

  /**
   * Create a new user
   */
  async create(data: RegisterDto): Promise<UserPublic> {
    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        isVerified: true,
        createdAt: true,
      },
    });

    logger.info('User created', { userId: user.id, email: user.email });

    return user;
  }

  /**
   * Verify user password
   */
  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) {
      return false;
    }

    return verifyPassword(password, user.passwordHash);
  }
}

/**
 * Token Repository
 * Handles token-related operations
 */
export class TokenRepository {
  /**
   * Generate access and refresh tokens for a user
   */
  async generateTokens(payload: TokenPayload): Promise<AuthTokens & { refreshTokenData: RefreshTokenData }> {
    const accessToken = generateAccessToken(payload);
    const refreshTokenData = generateRefreshToken();

    return {
      accessToken,
      refreshToken: refreshTokenData.token,
      refreshTokenData,
    };
  }

  /**
   * Store refresh token in database
   */
  async storeRefreshToken(
    userId: string,
    refreshToken: string,
    expiresAt: Date,
    metadata?: RequestMetadata
  ): Promise<void> {
    const tokenHash = hashRefreshToken(refreshToken);

    await storeRefreshTokenInDb(
      userId,
      tokenHash,
      expiresAt,
      metadata?.device,
      metadata?.ip,
      metadata?.userAgent
    );
  }

  /**
   * Validate and get token data
   */
  async validateRefreshToken(
    token: string
  ): Promise<{ userId: string; tokenId: string } | null> {
    return validateRefreshToken(token);
  }

  /**
   * Refresh tokens (with rotation)
   */
  async refreshTokens(
    refreshToken: string,
    metadata?: RequestMetadata
  ): Promise<AuthTokens> {
    // Validate existing refresh token
    const tokenData = await validateRefreshToken(refreshToken);

    if (!tokenData) {
      throw new Error('Invalid or expired refresh token');
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: tokenData.userId },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Revoke old refresh token (ROTATION)
    await revokeRefreshToken(tokenData.tokenId);

    // Generate new tokens
    const tokenResult = await this.generateTokens({
      userId: user.id,
      email: user.email,
    });

    // Store new refresh token
    const tokenHash = hashRefreshToken(tokenResult.refreshToken);

    await storeRefreshTokenInDb(
      user.id,
      tokenHash,
      tokenResult.refreshTokenData.expiresAt,
      metadata?.device,
      metadata?.ip,
      metadata?.userAgent
    );

    logger.info('Tokens refreshed', { userId: user.id });

    return {
      accessToken: tokenResult.accessToken,
      refreshToken: tokenResult.refreshToken,
    };
  }

  /**
   * Revoke a refresh token
   */
  async revokeToken(refreshToken: string): Promise<void> {
    const tokenData = await validateRefreshToken(refreshToken);
    if (tokenData) {
      await revokeRefreshToken(tokenData.tokenId);
    }
  }

  /**
   * Revoke all tokens for a user
   */
  async revokeAllTokens(userId: string): Promise<void> {
    await revokeAllUserTokens(userId);
    logger.info('All tokens revoked', { userId });
  }
}

