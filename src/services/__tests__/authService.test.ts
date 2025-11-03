import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../authService';
import { apiPost } from '@/helpers/apiHelper';

// Mock the apiHelper
vi.mock('@/helpers/apiHelper');

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateLoginForm', () => {
    it('returns no errors for valid credentials', () => {
      const errors = AuthService.validateLoginForm({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('returns error for empty email', () => {
      const errors = AuthService.validateLoginForm({
        email: '',
        password: 'password123',
      });

      expect(errors.email).toBe('Email is required');
    });

    it('returns error for invalid email format', () => {
      const errors = AuthService.validateLoginForm({
        email: 'invalid-email',
        password: 'password123',
      });

      expect(errors.email).toBe('Please enter a valid email address');
    });

    it('returns error for short password', () => {
      const errors = AuthService.validateLoginForm({
        email: 'test@example.com',
        password: '12345',
      });

      expect(errors.password).toBe('Password must be at least 6 characters');
    });
  });

  describe('hasValidationErrors', () => {
    it('returns false for empty errors object', () => {
      const hasErrors = AuthService.hasValidationErrors({});
      expect(hasErrors).toBe(false);
    });

    it('returns true for errors object with properties', () => {
      const hasErrors = AuthService.hasValidationErrors({ email: 'Required' });
      expect(hasErrors).toBe(true);
    });
  });

  describe('login', () => {
    it('calls apiPost with correct endpoint and credentials', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Login successful',
          data: {
            user: { id: 1, email: 'test@example.com' },
            menu: [],
            session: { session_id: '123' },
            oauth: { sso_token: 'token123' },
          },
        },
      };

      vi.mocked(apiPost).mockResolvedValue(mockResponse);

      await AuthService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(apiPost).toHaveBeenCalledWith(
        expect.stringContaining('/auth/sso/login'),
        {
          email: 'test@example.com',
          password: 'password123',
        }
      );
    });
  });

  describe('isAuthenticated', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('returns false when no token stored', () => {
      expect(AuthService.isAuthenticated()).toBe(false);
    });

    it('returns false when no user stored', () => {
      localStorage.setItem('auth_token', 'token123');
      expect(AuthService.isAuthenticated()).toBe(false);
    });

    it('returns true when both token and user stored', () => {
      localStorage.setItem('auth_token', 'token123');
      localStorage.setItem('auth_user', JSON.stringify({ id: 1 }));
      expect(AuthService.isAuthenticated()).toBe(true);
    });
  });
});

