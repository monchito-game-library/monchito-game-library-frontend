import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

import { UserAdminRepositoryContract } from '@/domain/repositories/user-admin.repository.contract';
import { UserAdminModel } from '@/models/user-admin/user-admin.model';
import { UserAdminRpcDto } from '@/dtos/supabase/user-admin.dto';
import { UserRoleType } from '@/types/user-role.type';
import { SUPABASE_CLIENT } from '@/data/config/supabase.config';

@Injectable()
export class SupabaseUserAdminRepository implements UserAdminRepositoryContract {
  private readonly _supabase: SupabaseClient = inject(SUPABASE_CLIENT);

  /**
   * Calls the SECURITY DEFINER function to retrieve all registered users with their roles.
   */
  async getAllUsers(): Promise<UserAdminModel[]> {
    const { data, error } = await this._supabase.rpc('get_all_users_with_roles');
    if (error) throw error;
    return (data as UserAdminRpcDto[]).map((row) => ({
      userId: row.user_id,
      email: row.email,
      role: (row.role ?? 'member') as UserRoleType,
      avatarUrl: row.avatar_url ?? null,
      createdAt: row.created_at
    }));
  }

  /**
   * Calls the SECURITY DEFINER function to update the role of a given user.
   *
   * @param {string} userId - UUID of the target user
   * @param {UserRoleType} role - New role to assign
   */
  async setUserRole(userId: string, role: UserRoleType): Promise<void> {
    const { error } = await this._supabase.rpc('set_user_role', {
      target_user_id: userId,
      new_role: role
    });
    if (error) throw error;
  }

  /**
   * Calls the SECURITY DEFINER function to permanently delete a user along with all
   * their associated data. The RPC enforces that the caller is the owner, that the
   * target is not the caller, and that the target is not another owner.
   *
   * @param {string} userId - UUID of the user to delete
   */
  async deleteUser(userId: string): Promise<void> {
    const { error } = await this._supabase.rpc('delete_user_cascade', {
      target_user_id: userId
    });
    if (error) throw error;
  }
}
