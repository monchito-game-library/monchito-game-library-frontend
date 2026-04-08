import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';
import { DatePipe, NgTemplateOutlet } from '@angular/common';

import { ORDERS_USE_CASES, OrdersUseCasesContract } from '@/domain/use-cases/orders/orders.use-cases.contract';
import { AuthStateService } from '@/services/auth-state.service';
import { UserContextService } from '@/services/user-context.service';
import { OrderInvitationModel } from '@/models/order/order-invitation.model';

@Component({
  selector: 'app-order-invite',
  templateUrl: './order-invite.component.html',
  styleUrl: './order-invite.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatProgressSpinner, MatIcon, TranslocoPipe, DatePipe, RouterLink, NgTemplateOutlet]
})
export class OrderInviteComponent implements OnInit {
  private readonly _ordersUseCases: OrdersUseCasesContract = inject(ORDERS_USE_CASES);
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _router: Router = inject(Router);

  readonly authState: AuthStateService = inject(AuthStateService);
  readonly userContext: UserContextService = inject(UserContextService);

  /** Whether the invitation is being validated. */
  readonly loading: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether the join action is in progress. */
  readonly joining: WritableSignal<boolean> = signal<boolean>(false);

  /** The validated invitation, or null if invalid/expired. */
  readonly invitation: WritableSignal<OrderInvitationModel | null> = signal<OrderInvitationModel | null>(null);

  /** Whether the token was checked and found invalid or expired. */
  readonly invalid: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether the user is already a member of this order. */
  readonly alreadyMember: WritableSignal<boolean> = signal<boolean>(false);

  private _token: string = '';

  ngOnInit(): void {
    this._token = this._route.snapshot.paramMap.get('token') ?? '';
    if (this.authState.isAuthenticated()) {
      void this._validateToken();
    }
  }

  /**
   * Navigates to the login page with a returnUrl pointing back to this invite page.
   */
  onGoToLogin(): void {
    void this._router.navigate(['/auth/login'], {
      queryParams: { returnUrl: `/orders/invite/${this._token}` }
    });
  }

  /**
   * Accepts the invitation and navigates to the order detail page.
   */
  async onJoin(): Promise<void> {
    const userId: string | null = this.userContext.userId();
    if (!userId || !this._token) return;

    this.joining.set(true);
    try {
      const orderId: string = await this._ordersUseCases.acceptInvitation(this._token, userId);
      void this._router.navigate(['/orders', orderId]);
    } catch {
      this.invalid.set(true);
    } finally {
      this.joining.set(false);
    }
  }

  /**
   * Validates the invitation token and sets the component state accordingly.
   */
  private async _validateToken(): Promise<void> {
    if (!this._token) {
      this.invalid.set(true);
      return;
    }

    this.loading.set(true);
    try {
      const result: OrderInvitationModel | null = await this._ordersUseCases.getInvitationByToken(this._token);
      if (!result) {
        this.invalid.set(true);
        return;
      }
      if (result.usedBy) {
        this.alreadyMember.set(true);
        this.invitation.set(result);
        return;
      }
      this.invitation.set(result);
    } catch {
      this.invalid.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
