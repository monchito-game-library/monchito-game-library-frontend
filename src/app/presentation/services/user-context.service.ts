import { computed, inject, Injectable, Signal } from '@angular/core';

import { AuthStateService } from './auth-state.service';
import { AUTH_USE_CASES, AuthUseCasesContract } from '@/domain/use-cases/auth/auth.use-cases.contract';

/**
 * Global facade for accessing the authenticated user and executing session actions.
 * Delegates state to AuthStateService and operations to AuthUseCasesContract.
 */
@Injectable({ providedIn: 'root' })
export class UserContextService {
  private readonly _authState: AuthStateService = inject(AuthStateService);
  private readonly _authUseCases: AuthUseCasesContract = inject(AUTH_USE_CASES);

  /** Computed signal with the authenticated user's ID, or null if not authenticated. */
  readonly userId: Signal<string | null> = computed((): string | null => this._authState.getUserId());

  /**
   * Returns the authenticated user's ID or throws if no user is authenticated.
   */
  requireUserId(): string {
    const id: string | null = this.userId();
    if (!id) throw new Error('No user selected');
    return id;
  }

  /**
   * Returns true if there is a currently authenticated user.
   */
  isUserSelected(): boolean {
    return this._authState.isAuthenticated();
  }

  /**
   * Signs out the current user.
   */
  clearUser(): void {
    void this._authUseCases.signOut();
  }

  /**
   * Returns the authenticated user's email address, or null if not authenticated.
   */
  getUserEmail(): string | null {
    return this._authState.getUserEmail();
  }

  /**
   * Returns the authenticated user's display name.
   */
  getDisplayName(): string {
    return this._authState.getDisplayName();
  }

  /**
   * Returns the authenticated user's avatar URL.
   * Generates an automatic avatar via ui-avatars.com if the user has no custom one.
   */
  getAvatarUrl(): string {
    const url: string | null = this._authState.getAvatarUrl();
    if (url) return url;

    const name: string = this._authState.getDisplayName();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;
  }
}
