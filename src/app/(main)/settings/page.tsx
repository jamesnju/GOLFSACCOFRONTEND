'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Update profile logic here
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text">Settings</h1>
        <p className="text-text/60 mt-1">Manage your account preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card className="border-primary/20">
          <h3 className="text-lg font-bold mb-4">Profile Settings</h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input
              label="First Name"
              defaultValue={user?.firstName || ''}
              placeholder="First name"
            />
            <Input
              label="Last Name"
              defaultValue={user?.lastName || ''}
              placeholder="Last name"
            />
            <Input
              label="Email Address"
              type="email"
              defaultValue={user?.email || ''}
              placeholder="Email"
              disabled
            />
            <Input
              label="Phone Number"
              defaultValue={user?.wallet?.balance ? formatCurrency(user.wallet.balance) : '0'}
              placeholder="Phone"
              disabled
            />
            <Button type="submit" isLoading={isLoading} fullWidth>
              Update Profile
            </Button>
          </form>
        </Card>

        {/* Account Information */}
        <div className="space-y-6">
          <Card className="border-primary/20">
            <h3 className="text-lg font-bold mb-4">Account Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-text/60">Role</p>
                <p className="text-sm font-medium capitalize">{user?.role || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-text/60">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user?.isActive ? 'bg-green-500/20 text-green-500' : 'bg-accent/20 text-accent'}`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <p className="text-sm text-text/60">Balance</p>
                <p className="text-sm font-bold">{formatCurrency(user?.wallet?.balance || 0)}</p>
              </div>
            </div>
          </Card>

          <Card className="border-accent/20 bg-accent/5">
            <h3 className="text-lg font-bold text-accent mb-4">Danger Zone</h3>
            <div className="space-y-4">
              <p className="text-sm text-text/60">
                Once you log out, you'll need to sign in again to access your account.
              </p>
              <Button
                variant="danger"
                onClick={signOut}
                fullWidth
              >
                Logout
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}