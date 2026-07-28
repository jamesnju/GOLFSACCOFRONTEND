'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate, formatCurrency, cn } from '@/lib/utils/helpers';
import { getAllUsers, activateUser, deactivateUser } from '@/lib/actions/admin.actions';
import useSWR from '@/lib/hooks/useSWR';
import toast from 'react-hot-toast';
import { Loader } from '@/components/ui/Loader/Loader';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const router = useRouter();

  // Create a string key for SWR
  const swrKey = `admin-users-${page}-${search}`;

  const { data, isLoading, revalidate, error } = useSWR(
    swrKey,
    () => getAllUsers({ page, limit: 10, search }),
    { 
      revalidateOnFocus: false,
      onError: (error) => {
        console.error('Failed to fetch users:', error);
        toast.error('Failed to load users');
      }
    }
  );

  const handleActivate = async (userId: string) => {
    try {
      const result = await activateUser(userId);
      if (!result.success) {
        toast.error(result.error || 'Failed to activate user');
        return;
      }
      toast.success('User activated successfully');
      revalidate(); // Refresh data after activation
    } catch (error) {
      toast.error('Failed to activate user');
    }
  };

  const handleDeactivate = async (userId: string) => {
    try {
      const result = await deactivateUser(userId);
      if (!result.success) {
        toast.error(result.error || 'Failed to deactivate user');
        return;
      }
      toast.success('User deactivated successfully');
      revalidate(); // Refresh data after deactivation
    } catch (error) {
      toast.error('Failed to deactivate user');
    }
  };

  const users = data?.success ? data.data?.users || [] : [];
  const pagination = data?.success ? data.data?.pagination : null;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    revalidate();
    toast.success('Refreshing users...');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Users</h1>
          <p className="text-text/60 mt-1">Manage all SACCO members</p>
        </div>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={handleSearchChange}
            className="w-64"
          />
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
            {isLoading ? 'Loading...' : '🔄 Refresh'}
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-accent/50 bg-accent/5">
          <div className="flex items-center gap-3 text-accent">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-medium">Failed to load users</p>
              <p className="text-sm text-text/60">{error.message || 'Please try again'}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-auto">
              Retry
            </Button>
          </div>
        </Card>
      )}

      <Card className="border-primary/20 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader size="lg" />
            <p className="text-text/60 text-sm mt-4">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">👥</div>
            <p className="text-text/60">No users found</p>
            <p className="text-text/40 text-sm mt-1">
              {search ? 'Try adjusting your search' : 'Users will appear here once they register'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary/10">
                    <th className="text-left p-4 text-sm font-medium text-text/60">User</th>
                    <th className="text-left p-4 text-sm font-medium text-text/60">Role</th>
                    <th className="text-left p-4 text-sm font-medium text-text/60">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-text/60">Joined</th>
                    <th className="text-right p-4 text-sm font-medium text-text/60">Balance</th>
                    <th className="text-center p-4 text-sm font-medium text-text/60">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any) => (
                    <tr
                      key={user.id}
                      className="border-b border-primary/5 hover:bg-primary/5 transition-colors"
                    >
                      <td className="p-4">
                        <div>
                          <p className="text-sm font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-text/40">{user.email}</p>
                          <p className="text-xs text-text/40">{user.phone}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm capitalize font-medium">
                          {user.role.toLowerCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            user.isActive
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-accent/20 text-accent'
                          )}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {!user.isActive && (
                          <span className="block text-xs text-text/40 mt-1">
                            Fee not paid
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-text/60">
                        {formatDate(user.joinDate)}
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-bold">
                          {formatCurrency(user.wallet?.balance || 0)}
                        </span>
                        {user.wallet?.lockedBalance > 0 && (
                          <span className="block text-xs text-text/40">
                            Locked: {formatCurrency(user.wallet.lockedBalance)}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          {user.isActive ? (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDeactivate(user.id)}
                            >
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleActivate(user.id)}
                            >
                              Activate
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/admin/users/${user.id}`)}
                          >
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-primary/10">
                <p className="text-sm text-text/60">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} -{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} users
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-text/60">
                    Page {page} of {pagination.pages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page >= pagination.pages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Stats Footer */}
      {!isLoading && !error && pagination && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-primary/20">
            <p className="text-sm text-text/60">Total Users</p>
            <p className="text-2xl font-bold text-primary">{pagination.total}</p>
          </Card>
          <Card className="border-primary/20">
            <p className="text-sm text-text/60">Active Users</p>
            <p className="text-2xl font-bold text-green-500">
              {users.filter((u: any) => u.isActive).length}
            </p>
          </Card>
          <Card className="border-primary/20">
            <p className="text-sm text-text/60">Inactive Users</p>
            <p className="text-2xl font-bold text-accent">
              {users.filter((u: any) => !u.isActive).length}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}