'use client';

import {
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';

import { useRouter } from 'next/navigation';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  formatDate,
  formatCurrency,
  cn,
} from '@/lib/utils/helpers';

import {
  getAllUsers,
  activateUser,
  deactivateUser,
} from '@/lib/actions/admin.actions';

import useSWR from '@/lib/hooks/useSWR';

import toast from 'react-hot-toast';
import { Loader } from '@/components/ui/Loader/Loader';

export default function AdminUsersPage() {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  /**
   * `searchInput` is what the user is currently typing.
   *
   * `search` is the value actually sent to the API.
   *
   * This separation prevents an API request on every keystroke.
   */
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const refreshingRef = useRef(false);

  const router = useRouter();

  // ---------------------------------------------------------------------------
  // SWR key
  // ---------------------------------------------------------------------------

  /**
   * The request should only change when:
   *
   * - page changes
   * - search changes
   *
   * Typing into the search box does NOT change this key until
   * the 500ms debounce completes.
   */
  const swrKey = `admin-users-${page}-${search}`;

  // ---------------------------------------------------------------------------
  // Stable fetcher
  // ---------------------------------------------------------------------------

  /**
   * Keep the fetcher stable.
   *
   * This prevents the custom useSWR hook from receiving a new
   * fetcher function on every render.
   */
  const fetchUsers = useCallback(() => {
    return getAllUsers({
      page,
      limit: 10,
      search,
    });
  }, [page, search]);

  // ---------------------------------------------------------------------------
  // SWR
  // ---------------------------------------------------------------------------

  const {
    data,
    isLoading,
    revalidate,
    error,
    isValidating,
  } = useSWR(
    swrKey,
    fetchUsers,
    {
      /**
       * Do NOT automatically call the API when:
       *
       * - browser gets focus
       * - internet reconnects
       * - cached data becomes stale
       */
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,

      /**
       * Prevent duplicate requests within 10 seconds.
       */
      dedupingInterval: 10000,

      onError: (error) => {
        console.error(
          'Failed to fetch users:',
          error
        );

        toast.error('Failed to load users');

        setIsRefreshing(false);
      },

      onSuccess: () => {
        setIsRefreshing(false);
      },
    }
  );

  // ---------------------------------------------------------------------------
  // Activate user
  // ---------------------------------------------------------------------------

  const handleActivate = async (userId: string) => {
    try {
      const result = await activateUser(userId);

      if (!result.success) {
        toast.error(
          result.error || 'Failed to activate user'
        );

        return;
      }

      toast.success(
        'User activated successfully'
      );

      /**
       * Explicitly refresh after modifying the user.
       */
      await revalidate();
    } catch (error) {
      console.error(
        'Failed to activate user:',
        error
      );

      toast.error(
        'Failed to activate user'
      );
    }
  };

  // ---------------------------------------------------------------------------
  // Deactivate user
  // ---------------------------------------------------------------------------

  const handleDeactivate = async (userId: string) => {
    try {
      const result = await deactivateUser(userId);

      if (!result.success) {
        toast.error(
          result.error || 'Failed to deactivate user'
        );

        return;
      }

      toast.success(
        'User deactivated successfully'
      );

      /**
       * Explicitly refresh after modifying the user.
       */
      await revalidate();
    } catch (error) {
      console.error(
        'Failed to deactivate user:',
        error
      );

      toast.error(
        'Failed to deactivate user'
      );
    }
  };

  // ---------------------------------------------------------------------------
  // Search
  // ---------------------------------------------------------------------------

  const handleSearchChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const value = e.target.value;

      /**
       * Update the textbox immediately.
       *
       * This does NOT call the API.
       */
      setSearchInput(value);

      /**
       * Cancel the previous timer.
       */
      if (searchTimeoutRef.current) {
        clearTimeout(
          searchTimeoutRef.current
        );
      }

      /**
       * Wait 500ms after the user stops typing.
       */
      searchTimeoutRef.current =
        setTimeout(() => {
          const trimmedValue =
            value.trim();

          /**
           * Search always starts from page 1.
           */
          setPage(1);

          /**
           * This changes the SWR key and causes
           * exactly one fetch for the new search.
           */
          setSearch(trimmedValue);
        }, 500);
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Search cleanup
  // ---------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(
          searchTimeoutRef.current
        );

        searchTimeoutRef.current = null;
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Pagination
  // ---------------------------------------------------------------------------

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1) {
        return;
      }

      setPage((currentPage) => {
        /**
         * Do nothing if the requested page
         * is already active.
         */
        if (currentPage === newPage) {
          return currentPage;
        }

        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });

        return newPage;
      });
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Refresh
  // ---------------------------------------------------------------------------

  const handleRefresh = useCallback(
    async () => {
      /**
       * Prevent double-clicking Refresh from
       * generating multiple API requests.
       */
      if (refreshingRef.current) {
        return;
      }

      refreshingRef.current = true;
      setIsRefreshing(true);

      toast.loading(
        'Refreshing users...',
        {
          id: 'refresh',
        }
      );

      try {
        /**
         * revalidate() deliberately clears the
         * current cache and fetches fresh data.
         */
        await revalidate();

        toast.success(
          'Users refreshed!',
          {
            id: 'refresh',
          }
        );
      } catch (error) {
        console.error(
          'Failed to refresh users:',
          error
        );

        toast.error(
          'Failed to refresh users',
          {
            id: 'refresh',
          }
        );
      } finally {
        refreshingRef.current = false;
        setIsRefreshing(false);
      }
    },
    [revalidate]
  );

  // ---------------------------------------------------------------------------
  // Data
  // ---------------------------------------------------------------------------

  const users =
    data?.success
      ? data.data?.users || []
      : [];

  const pagination =
    data?.success
      ? data.data?.pagination
      : null;

  const hasError =
    error ||
    (data && !data.success);

  // ---------------------------------------------------------------------------
  // Statistics
  // ---------------------------------------------------------------------------

  const activeCount =
    users.filter(
      (u: any) => u.isActive
    ).length;

  const inactiveCount =
    users.filter(
      (u: any) => !u.isActive
    ).length;

  // ---------------------------------------------------------------------------
  // Loading states
  // ---------------------------------------------------------------------------

  /**
   * Only show the full loading screen
   * when we don't have any data yet.
   */
  const showLoading =
    isLoading &&
    !data &&
    !isRefreshing;

  /**
   * Used to disable buttons while a refresh
   * or validation is running.
   */
  const showRefreshing =
    isRefreshing ||
    isValidating;

  // ---------------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-8">

      {/* ------------------------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-text">
            Users
          </h1>

          <p className="text-text/60 mt-1">
            Manage all SACCO members
          </p>
        </div>

        <div className="flex items-center gap-4">

          {/* Search */}

          <Input
            placeholder="Search users..."
            value={searchInput}
            onChange={handleSearchChange}
            className="w-64"
          />

          {/* Refresh */}

          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={showRefreshing}
          >
            {showRefreshing ? (
              <div className="flex items-center gap-2">
                <Loader size="sm" />

                <span>
                  Refreshing...
                </span>
              </div>
            ) : (
              '🔄 Refresh'
            )}
          </Button>

        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Error */}
      {/* ------------------------------------------------------------------ */}

      {hasError && (
        <Card className="border-accent/50 bg-accent/5">

          <div className="flex items-center gap-3 text-accent">

            <span className="text-2xl">
              ⚠️
            </span>

            <div>
              <p className="font-medium">
                Failed to load users
              </p>

              <p className="text-sm text-text/60">
                {error?.message ||
                  data?.error ||
                  'Please try again'}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="ml-auto"
              disabled={showRefreshing}
            >
              Retry
            </Button>

          </div>

        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Users table */}
      {/* ------------------------------------------------------------------ */}

      <Card className="border-primary/20 overflow-hidden">

        {showLoading ? (

          <div className="flex flex-col items-center justify-center py-12">

            <Loader size="lg" />

            <p className="text-text/60 text-sm mt-4">
              Loading users...
            </p>

          </div>

        ) : users.length === 0 ? (

          <div className="p-8 text-center">

            <div className="text-4xl mb-4">
              👥
            </div>

            <p className="text-text/60">
              No users found
            </p>

            <p className="text-text/40 text-sm mt-1">
              {search
                ? 'Try adjusting your search'
                : 'Users will appear here once they register'}
            </p>

          </div>

        ) : (

          <>
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-primary/10">

                    <th className="text-left p-4 text-sm font-medium text-text/60">
                      User
                    </th>

                    <th className="text-left p-4 text-sm font-medium text-text/60">
                      Role
                    </th>

                    <th className="text-left p-4 text-sm font-medium text-text/60">
                      Status
                    </th>

                    <th className="text-left p-4 text-sm font-medium text-text/60">
                      Joined
                    </th>

                    <th className="text-right p-4 text-sm font-medium text-text/60">
                      Balance
                    </th>

                    <th className="text-center p-4 text-sm font-medium text-text/60">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {users.map(
                    (user: any) => (
                      <tr
                        key={user.id}
                        className="border-b border-primary/5 hover:bg-primary/5 transition-colors"
                      >

                        {/* User */}

                        <td className="p-4">

                          <div>

                            <p className="text-sm font-medium">
                              {user.firstName}{' '}
                              {user.lastName}
                            </p>

                            <p className="text-xs text-text/40">
                              {user.email}
                            </p>

                            <p className="text-xs text-text/40">
                              {user.phone}
                            </p>

                          </div>

                        </td>

                        {/* Role */}

                        <td className="p-4">

                          <span className="text-sm capitalize font-medium">
                            {user.role.toLowerCase()}
                          </span>

                        </td>

                        {/* Status */}

                        <td className="p-4">

                          <span
                            className={cn(
                              'px-2 py-1 rounded-full text-xs font-medium',
                              user.isActive
                                ? 'bg-green-500/20 text-green-500'
                                : 'bg-accent/20 text-accent'
                            )}
                          >
                            {user.isActive
                              ? 'Active'
                              : 'Inactive'}
                          </span>

                          {!user.isActive && (
                            <span className="block text-xs text-text/40 mt-1">
                              Fee not paid
                            </span>
                          )}

                        </td>

                        {/* Joined */}

                        <td className="p-4 text-sm text-text/60">
                          {formatDate(
                            user.joinDate
                          )}
                        </td>

                        {/* Balance */}

                        <td className="p-4 text-right">

                          <span className="font-bold">
                            {formatCurrency(
                              user.wallet?.balance || 0
                            )}
                          </span>

                          {user.wallet
                            ?.lockedBalance > 0 && (
                            <span className="block text-xs text-text/40">
                              Locked:{' '}
                              {formatCurrency(
                                user.wallet
                                  .lockedBalance
                              )}
                            </span>
                          )}

                        </td>

                        {/* Actions */}

                        <td className="p-4 text-center">

                          <div className="flex flex-wrap items-center justify-center gap-2">

                            {user.isActive ? (

                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() =>
                                  handleDeactivate(
                                    user.id
                                  )
                                }
                                disabled={
                                  showRefreshing
                                }
                              >
                                Deactivate
                              </Button>

                            ) : (

                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() =>
                                  handleActivate(
                                    user.id
                                  )
                                }
                                disabled={
                                  showRefreshing
                                }
                              >
                                Activate
                              </Button>

                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(
                                  `/admin/users/${user.id}`
                                )
                              }
                              disabled={
                                showRefreshing
                              }
                            >
                              View
                            </Button>

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* ---------------------------------------------------------------- */}
            {/* Pagination */}
            {/* ---------------------------------------------------------------- */}

            {pagination &&
              pagination.pages > 1 && (

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-primary/10">

                  <p className="text-sm text-text/60">

                    Showing{' '}
                    {(
                      (pagination.page - 1) *
                      pagination.limit
                    ) + 1}{' '}

                    -{' '}

                    {Math.min(
                      pagination.page *
                        pagination.limit,
                      pagination.total
                    )}{' '}

                    of{' '}

                    {pagination.total}{' '}
                    users

                  </p>

                  <div className="flex items-center gap-2">

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={
                        page <= 1 ||
                        showRefreshing
                      }
                      onClick={() =>
                        handlePageChange(
                          page - 1
                        )
                      }
                    >
                      Previous
                    </Button>

                    <span className="text-sm text-text/60">
                      Page {page} of{' '}
                      {pagination.pages}
                    </span>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={
                        page >=
                          pagination.pages ||
                        showRefreshing
                      }
                      onClick={() =>
                        handlePageChange(
                          page + 1
                        )
                      }
                    >
                      Next
                    </Button>

                  </div>

                </div>

              )}

          </>

        )}

      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Statistics */}
      {/* ------------------------------------------------------------------ */}

      {!showLoading &&
        !error &&
        pagination &&
        !hasError && (

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <Card className="border-primary/20">

              <p className="text-sm text-text/60">
                Total Users
              </p>

              <p className="text-2xl font-bold text-primary">
                {pagination.total}
              </p>

            </Card>

            <Card className="border-primary/20">

              <p className="text-sm text-text/60">
                Active Users
              </p>

              <p className="text-2xl font-bold text-green-500">
                {activeCount}
              </p>

            </Card>

            <Card className="border-primary/20">

              <p className="text-sm text-text/60">
                Inactive Users
              </p>

              <p className="text-2xl font-bold text-accent">
                {inactiveCount}
              </p>

            </Card>

          </div>

        )}

    </div>
  );
}