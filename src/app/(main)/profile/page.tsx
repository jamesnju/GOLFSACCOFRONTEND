'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDate, cn } from '@/lib/utils/helpers';
import { useWallet } from '@/lib/hooks/useWallet';
import { useLoans } from '@/lib/hooks/useLoans';
import toast from 'react-hot-toast';
import { Loader } from '@/components/ui/Loader/Loader';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { balance } = useWallet();
  const { userLoans } = useLoans();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: session?.user?.firstName || '',
    lastName: session?.user?.lastName || '',
    phone: session?.user?.phone || '',
  });

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" text="Loading profile..." />
      </div>
    );
  }

  if (!session?.user) {
    router.push('/login');
    return null;
  }

  const user = session.user;
  const activeLoans = userLoans?.data?.filter((l: any) => l.status === 'ACTIVE') || [];

  const handleUpdateProfile = async () => {
    try {
      // Update profile logic here
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Profile</h1>
          <p className="text-text/60 mt-1">Manage your personal information</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={cn(
            'px-3 py-1 rounded-full text-sm font-medium',
            user.isActive
              ? 'bg-green-500/20 text-green-500'
              : 'bg-accent/20 text-accent'
          )}>
            {user.isActive ? '✅ Active' : '⏳ Pending'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-primary/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Personal Information</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                  <Input
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
                <Input
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <Input
                  label="Email Address"
                  value={user.email || ''}
                  disabled
                />
                <Button type="submit">Save Changes</Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-text/60">First Name</p>
                    <p className="text-base font-medium">{user.firstName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text/60">Last Name</p>
                    <p className="text-base font-medium">{user.lastName || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-text/60">Email Address</p>
                  <p className="text-base font-medium">{user.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-text/60">Phone Number</p>
                  <p className="text-base font-medium">{user.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-text/60">Role</p>
                  <p className="text-base font-medium capitalize">{user.role || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-text/60">Member Since</p>
                  <p className="text-base font-medium">
                    {user.joinDate ? formatDate(user.joinDate) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text/60">Registration Fee</p>
                  <p className="text-base font-medium">
                    {user.registrationFeePaid ? '✅ Paid' : '❌ Not Paid'}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          <Card className="border-primary/20">
            <h3 className="text-lg font-bold mb-4">Account Summary</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-text/60">Total Balance</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(balance?.balance || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-text/60">Available Balance</p>
                <p className="text-xl font-bold text-secondary">
                  {formatCurrency(balance?.availableBalance || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-text/60">Locked Balance</p>
                <p className="text-xl font-bold text-accent">
                  {formatCurrency(balance?.lockedBalance || 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-primary/20">
            <h3 className="text-lg font-bold mb-4">Loan Status</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-text/60">Active Loans</p>
                <p className="text-2xl font-bold text-secondary">
                  {activeLoans.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-text/60">Loan Eligibility</p>
                <p className="text-xl font-bold text-accent">
                  {balance?.isEligibleForLoan ? '✅ Eligible' : '⏳ Not Eligible'}
                </p>
              </div>
              {balance?.activeLoan && (
                <div className="mt-2 p-3 bg-primary/5 rounded-lg">
                  <p className="text-sm text-text/60">Active Loan Balance</p>
                  <p className="text-lg font-bold text-accent">
                    {formatCurrency(balance.activeLoan.balance)}
                  </p>
                  <p className="text-xs text-text/40">
                    Due: {formatDate(balance.activeLoan.dueDate)}
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card className="border-primary/20">
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                fullWidth
                onClick={() => router.push('/settings')}
              >
                ⚙️ Settings
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => router.push('/transactions')}
              >
                📊 Transaction History
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => router.push('/savings')}
              >
                💰 Savings
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}