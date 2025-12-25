import { verifyPassword } from '../../lib/auth';
import { UserRepository, TokenRepository } from './repository';
import { RegisterDto, LoginDto, AuthResponse, RequestMetadata } from './dto';
import logger from '../../config/logger';

/**
 * Auth Service
 * Handles authentication business logic
 */
export class AuthService {
  private userRepository: UserRepository;
  private tokenRepository: TokenRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.tokenRepository = new TokenRepository();
  }

  /**
   * Register a new user
   */
  async register(
    data: RegisterDto,
    metadata?: RequestMetadata
  ): Promise<AuthResponse> {
    // Check if user already exists
    // TODO: maybe add email verification later
    const exists = await this.userRepository.existsByEmail(data.email);

    if (exists) {
      throw new Error('User with this email already exists');
    }

    // Create user
    const user = await this.userRepository.create(data);

    // Generate tokens
    const tokenResult = await this.tokenRepository.generateTokens({
      userId: user.id,
      email: user.email,
    });

    // Store refresh token
    await this.tokenRepository.storeRefreshToken(
      user.id,
      tokenResult.refreshToken,
      tokenResult.refreshTokenData.expiresAt,
      metadata
    );

    const tokens = {
      accessToken: tokenResult.accessToken,
      refreshToken: tokenResult.refreshToken,
    };

    logger.info('User registered', { userId: user.id, email: user.email });

    return {
      user,
      ...tokens,
    };
  }

  /**
   * Login user
   */
  async login(
    data: LoginDto,
    metadata?: RequestMetadata
  ): Promise<AuthResponse> {
    // Find user
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      // Don't reveal if user exists (security best practice)
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await verifyPassword(data.password, user.passwordHash);

    if (!isValidPassword) {
      // console.log('Failed login for:', data.email); // removed for security
      logger.warn('Failed login attempt', { email: data.email.toLowerCase() });
      throw new Error('Invalid email or password');
    }

    logger.info('User logged in', { userId: user.id, email: user.email });

    // Generate tokens
    const tokenResult = await this.tokenRepository.generateTokens({
      userId: user.id,
      email: user.email,
    });

    // Store refresh token
    await this.tokenRepository.storeRefreshToken(
      user.id,
      tokenResult.refreshToken,
      tokenResult.refreshTokenData.expiresAt,
      metadata
    );

    const tokens = {
      accessToken: tokenResult.accessToken,
      refreshToken: tokenResult.refreshToken,
    };

    return {
      user: {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refresh(
    refreshToken: string,
    metadata?: RequestMetadata
  ) {
    return this.tokenRepository.refreshTokens(refreshToken, metadata);
  }

  /**
   * Logout user
   */
  async logout(refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await this.tokenRepository.revokeToken(refreshToken);
    }
  }

  /**
   * Logout from all devices
   */
  async logoutAll(userId: string): Promise<void> {
    await this.tokenRepository.revokeAllTokens(userId);
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    return this.userRepository.findById(userId);
  }
}

