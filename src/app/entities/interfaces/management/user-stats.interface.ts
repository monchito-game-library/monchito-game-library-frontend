/** Aggregated counters of registered users (excluding the owner) shown as stats. */
export interface UserStatsInterface {
  /** Total non-owner users (admins + members). */
  total: number;
  /** Number of users with the `admin` role. */
  admins: number;
  /** Number of users with the `member` role. */
  members: number;
}
