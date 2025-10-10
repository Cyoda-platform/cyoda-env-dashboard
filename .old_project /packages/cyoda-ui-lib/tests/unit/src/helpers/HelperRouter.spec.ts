import { describe, it, expect, vi } from 'vitest';
import { checkForPublic } from '../../../../src/helpers/HelperRouter';
import { useAuthStore } from '../../../../src/stores/auth';

vi.mock('../../../../src/stores/auth', () => ({
  useAuthStore: vi.fn(),
}));

describe('checkForPublic', () => {
  it('should redirect to login if route is not public and user is not logged in', () => {
    const authStoreMock = {
      isLoggedIn: false,
      logout: vi.fn(),
    };
    (useAuthStore as vi.Mock).mockReturnValue(authStoreMock);

    const to = {
      matched: [{ meta: { isPublic: false } }],
      fullPath: '/protected',
    };
    const next = vi.fn();

    checkForPublic(to, next);

    expect(authStoreMock.logout).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith({
      path: '/login',
      query: { redirect: '/protected' },
    });
  });

  it('should proceed to next route if route is not public and user is logged in', () => {
    const authStoreMock = {
      isLoggedIn: true,
      logout: vi.fn(),
    };
    (useAuthStore as vi.Mock).mockReturnValue(authStoreMock);

    const to = {
      matched: [{ meta: { isPublic: false } }],
      fullPath: '/protected',
    };
    const next = vi.fn();

    checkForPublic(to, next);

    expect(authStoreMock.logout).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });

  it('should proceed to next route if route is public', () => {
    const authStoreMock = {
      isLoggedIn: false,
      logout: vi.fn(),
    };
    (useAuthStore as vi.Mock).mockReturnValue(authStoreMock);

    const to = {
      matched: [{ meta: { isPublic: true } }],
      fullPath: '/public',
    };
    const next = vi.fn();

    checkForPublic(to, next);

    expect(authStoreMock.logout).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });
});
