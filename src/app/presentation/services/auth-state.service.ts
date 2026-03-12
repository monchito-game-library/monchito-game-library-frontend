import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';

import { AUTH_USE_CASES, AuthUseCasesContract } from '@/domain/use-cases/auth/auth.use-cases.contract';
import { AuthUserModel } from '@/models/auth/auth-user.model';

/**
 * Presentation service that holds reactive auth session state.
 * Does not contain business logic — only shares the authenticated user across components.
 */
@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly _authUseCases: AuthUseCasesContract = inject(AUTH_USE_CASES);
  private readonly _router: Router = inject(Router);

  private readonly _currentUser: WritableSignal<AuthUserModel | null> = signal(null);
  private readonly _loading: WritableSignal<boolean> = signal(true);

  /** Currently authenticated user, or null if not authenticated. */
  readonly currentUser: Signal<AuthUserModel | null> = this._currentUser.asReadonly();

  /** Whether the initial session is still being resolved. */
  readonly loading: Signal<boolean> = this._loading.asReadonly();

  constructor() {
    void this._initSession();
  }

  /**
   * Resolves the active session on startup and registers the auth-state change listener.
   */
  private async _initSession(): Promise<void> {
    const user: AuthUserModel | null = await this._authUseCases.getSession();
    this._currentUser.set(user);
    this._loading.set(false);

    this._authUseCases.onAuthStateChange((updatedUser: AuthUserModel | null) => {
      const wasAuthenticated: boolean = this._currentUser() !== null;
      this._currentUser.set(updatedUser);

      if (wasAuthenticated && updatedUser === null) {
        void this._router.navigate(['/login']);
      }
    });
  }

  /**
   * Returns true if there is an authenticated user.
   */
  isAuthenticated(): boolean {
    return this._currentUser() !== null;
  }

  /**
   * Returns the authenticated user's ID, or null if no session is active.
   */
  getUserId(): string | null {
    return this._currentUser()?.id ?? null;
  }

  /**
   * Returns the authenticated user's email address.
   */
  getUserEmail(): string | null {
    return this._currentUser()?.email ?? null;
  }

  /**
   * Returns the authenticated user's display name.
   */
  getDisplayName(): string {
    return this._currentUser()?.displayName ?? '';
  }

  /**
   * Returns the authenticated user's avatar URL, or null if none is set.
   */
  getAvatarUrl(): string | null {
    return this._currentUser()?.avatarUrl ?? null;
  }
}
