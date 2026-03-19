/** Row returned by the get_all_users_with_roles RPC. */
export interface UserAdminRpcDto {
  user_id: string;
  email: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
}
