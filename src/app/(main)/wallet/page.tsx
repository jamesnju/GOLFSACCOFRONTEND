'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDate, cn } from '@/lib/utils/helpers';
import { useWallet } from '@/lib/hooks/useWallet';
import { useLoans } from '@/lib/hooks/useLoans';
import { initiatePayment } from '@/lib/actions/payment.actions';
import { usePaymentStatus } from '@/lib/hooks/usePaymentStatus';
import toast from 'react-hot-toast';
import useTransactions from '@/lib/hooks/useTransactions';
import {
  PhoneIcon,
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Loader } from '@/components/ui/Loader/Loader';

export default function WalletPage() {
  const router = useRouter();
  const { balance, isLoading: walletLoading, refreshBalance } = useWallet();
  const { eligibility, userLoans, isLoading: loansLoading } = useLoans();
  const { transactions, isLoading: txLoading } = useTransactions();
  
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw'>('overview');
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);

  // Payment status handling
  const { status, isPolling, reset } = usePaymentStatus(checkoutRequestId, () => {
    // Refresh balance when payment is complete
    refreshBalance();
    // Reset after a short delay to show success message
    setTimeout(() => {
      setCheckoutRequestId(null);
      reset();
    }, 2000);
  });

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount < 100) {
      toast.error('Minimum deposit is KES 100');
      return;
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid M-Pesa phone number');
      return;
    }

    setIsDepositing(true);
    try {
      const result = await initiatePayment({
        phoneNumber,
        amount,
        purpose: 'DEPOSIT',
      });

      if (!result.success) {
        toast.error(result.error || 'Payment initiation failed');
        return;
      }

      // Store the checkout request ID for polling
      setCheckoutRequestId(result.checkoutRequestId || null);
      
      toast.success('Payment initiated! Please check your phone for M-Pesa prompt.');
      setDepositAmount('');
      setPhoneNumber('');
      
    } catch (error: any) {
      toast.error(error.message || 'Deposit failed');
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 100) {
      toast.error('Minimum withdrawal is KES 100');
      return;
    }

    if (amount > (balance?.availableBalance || 0)) {
      toast.error('Insufficient available balance');
      return;
    }

    setIsWithdrawing(true);
    try {
      toast.success(`Withdrawal of ${formatCurrency(amount)} submitted!`);
      setWithdrawAmount('');
      refreshBalance();
    } catch (error: any) {
      toast.error(error.message || 'Withdrawal failed');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const isLoading = walletLoading || loansLoading || txLoading || isPolling;

  // Show payment status overlay
  if (checkoutRequestId && status.status !== 'PENDING') {
    const isSuccess = status.status === 'COMPLETED';
    
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md p-8 text-center border-primary/20">
          {isSuccess ? (
            <>
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-text mb-2">Payment Successful! ✅</h3>
              <p className="text-text/60 mb-4">
                {status.message || 'Your deposit has been processed successfully.'}
              </p>
              {status.payment && (
                <div className="bg-primary/5 p-4 rounded-lg mb-4">
                  <p className="text-sm text-text/60">
                    Amount: <span className="font-bold text-primary">{formatCurrency(status.payment.amount)}</span>
                  </p>
                  <p className="text-sm text-text/60">
                    M-Pesa Code: <span className="font-bold">{status.payment.mpesaCode || 'N/A'}</span>
                  </p>
                </div>
              )}
              <Button onClick={() => { setCheckoutRequestId(null); reset(); }}>
                Continue
              </Button>
            </>
          ) : status.status === 'FAILED' ? (
            <>
              <XCircleIcon className="w-16 h-16 text-accent mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-text mb-2">Payment Failed ❌</h3>
              <p className="text-text/60 mb-4">
                {status.message || 'Payment failed. Please try again.'}
              </p>
              <Button onClick={() => { setCheckoutRequestId(null); reset(); }}>
                Try Again
              </Button>
            </>
          ) : (
            <>
              <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-text mb-2">Payment Pending ⏳</h3>
              <p className="text-text/60 mb-4">
                {status.message || 'Payment is taking longer than expected. Please check your M-Pesa messages.'}
              </p>
              <Button onClick={() => { setCheckoutRequestId(null); reset(); }}>
                Check Later
              </Button>
            </>
          )}
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" text={isPolling ? 'Processing payment...' : 'Loading wallet data...'} />
      </div>
    );
  }

  const loans = userLoans?.data || [];
  const activeLoans = loans.filter((l: any) => l.status === 'ACTIVE');
  const recentTransactions = transactions?.transactions?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text">Wallet</h1>
        <p className="text-text/60 mt-1">Manage your savings, loans, and transactions</p>
      </div>

      {/* Show polling status if in progress */}
      {isPolling && (
        <Card className="border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3 p-2">
            <Loader size="sm" />
            <p className="text-sm text-text/60">Waiting for M-Pesa confirmation...</p>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex border-b border-primary/10 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            'px-4 sm:px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap',
            activeTab === 'overview'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text/60 hover:text-text'
          )}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('deposit')}
          className={cn(
            'px-4 sm:px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap',
            activeTab === 'deposit'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text/60 hover:text-text'
          )}
        >
          💰 Deposit
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={cn(
            'px-4 sm:px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap',
            activeTab === 'withdraw'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text/60 hover:text-text'
          )}
        >
          🏦 Withdraw
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
              <div className="space-y-2">
                <p className="text-sm text-text/60">Total Balance</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary">
                  {formatCurrency(balance?.balance || 0)}
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/30">
              <div className="space-y-2">
                <p className="text-sm text-text/60">Available</p>
                <p className="text-2xl sm:text-3xl font-bold text-secondary">
                  {formatCurrency(balance?.availableBalance || 0)}
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30">
              <div className="space-y-2">
                <p className="text-sm text-text/60">Locked</p>
                <p className="text-2xl sm:text-3xl font-bold text-accent">
                  {formatCurrency(balance?.lockedBalance || 0)}
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
              <div className="space-y-2">
                <p className="text-sm text-text/60">Active Loans</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary">
                  {activeLoans.length}
                </p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-primary/20">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => setActiveTab('deposit')}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all"
                >
                  <span className="text-2xl">💰</span>
                  <span className="text-sm text-text">Deposit</span>
                </button>
                {/* <button
                  onClick={() => setActiveTab('withdraw')}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all"
                >
                  <span className="text-2xl">🏦</span>
                  <span className="text-sm text-text">Withdraw</span>
                </button> */}
                {balance?.isEligibleForLoan && (
                  <button
                    onClick={() => router.push('/loans')}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all"
                  >
                    <span className="text-2xl">📝</span>
                    <span className="text-sm text-text">Apply Loan</span>
                  </button>
                )}
                <button
                  onClick={() => router.push('/transactions')}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all"
                >
                  <span className="text-2xl">📊</span>
                  <span className="text-sm text-text">History</span>
                </button>
              </div>
            </Card>

            <Card className="border-primary/20">
              <h3 className="text-lg font-bold mb-4">Loan Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text/60">Eligibility</span>
                  <span className={cn(
                    'text-sm font-bold',
                    eligibility?.isEligible ? 'text-green-500' : 'text-accent'
                  )}>
                    {eligibility?.isEligible ? '✅ Eligible' : '⏳ Not Eligible'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text/60">Max Loan</span>
                  <span className="text-sm font-bold text-primary">
                    {formatCurrency(eligibility?.maxLoanAmount || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text/60">Savings Required</span>
                  <span className="text-sm font-bold text-secondary">
                    {formatCurrency(eligibility?.minSavingsRequirement || 2000)}
                  </span>
                </div>
                {balance?.activeLoan && (
                  <div className="mt-3 p-3 bg-accent/10 rounded-lg">
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
          </div>

          <Card className="border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Recent Transactions</h3>
              <Button variant="ghost" size="sm" onClick={() => router.push('/transactions')}>
                View All →
              </Button>
            </div>
            {recentTransactions.length === 0 ? (
              <p className="text-text/60 text-sm">No recent transactions</p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-primary/5">
                    <div>
                      <p className="text-sm font-medium">{tx.description || tx.type}</p>
                      <p className="text-xs text-text/40">{formatDate(tx.createdAt)}</p>
                    </div>
                    <p className={cn(
                      'text-sm font-bold',
                      tx.type === 'DEPOSIT' || tx.type === 'LOAN_DISBURSEMENT'
                        ? 'text-green-500'
                        : 'text-accent'
                    )}>
                      {tx.type === 'DEPOSIT' || tx.type === 'LOAN_DISBURSEMENT' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {/* Deposit Tab with M-Pesa STK Push */}
      {activeTab === 'deposit' && !isPolling && (
        <Card className="border-primary/20">
          <h3 className="text-lg font-bold mb-4">Deposit Funds via M-Pesa</h3>
          <div className="space-y-4">
            <p className="text-sm text-text/60">
              Deposit money into your wallet using M-Pesa STK Push. Minimum deposit is KES 100.
            </p>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text/80">
                Amount (KES)
              </label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="flex-1"
              />
              <div className="flex gap-2 flex-wrap">
                {[1000, 2000, 5000, 10000, 20000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setDepositAmount(amount.toString())}
                    className="px-3 py-1 text-sm bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-text/80">
                M-Pesa Phone Number
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text/30">
                  <PhoneIcon className="w-5 h-5" />
                </div>
                <Input
                  type="tel"
                  placeholder="0712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10"
                  helperText="Enter the phone number registered with M-Pesa"
                />
              </div>
            </div>

            <Button
              onClick={handleDeposit}
              isLoading={isDepositing}
              disabled={!depositAmount || parseFloat(depositAmount) < 100 || !phoneNumber || phoneNumber.length < 10}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-background font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40"
              fullWidth
              size="lg"
            >
              {isDepositing ? 'Processing...' : 'Pay with M-Pesa'}
              {!isDepositing && <ArrowRightIcon className="w-5 h-5 ml-2" />}
            </Button>

            <div className="flex items-center gap-2 text-xs text-text/40 justify-center">
              <ClockIcon className="w-4 h-4" />
              <span>You will receive an M-Pesa prompt on your phone to complete the payment</span>
            </div>
          </div>
        </Card>
      )}

      {/* Withdraw Tab */}
      {activeTab === 'withdraw' && (
        <Card className="border-primary/20">
          <h3 className="text-lg font-bold mb-4">Withdraw Funds</h3>
          <div className="space-y-4">
            <p className="text-sm text-text/60">
              Withdraw money from your wallet. Minimum withdrawal is KES 100.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="number"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleWithdraw}
                isLoading={isWithdrawing}
                variant="outline"
                disabled={!withdrawAmount || parseFloat(withdrawAmount) < 100}
              >
                Request Withdrawal
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[1000, 2000, 5000, 10000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setWithdrawAmount(amount.toString())}
                  className="px-3 py-1 text-sm bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>
            <p className="text-xs text-text/40">
              Available balance: {formatCurrency(balance?.availableBalance || 0)}
            </p>
            {balance?.lockedBalance && balance.lockedBalance > 0 && (
              <p className="text-xs text-text/40">
                Locked balance: {formatCurrency(balance.lockedBalance)} (active loan collateral)
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Card } from '@/components/ui/Card';
// import { Button } from '@/components/ui/Button';
// import { Input } from '@/components/ui/Input';
// import { formatCurrency, formatDate, cn } from '@/lib/utils/helpers';
// import { useWallet } from '@/lib/hooks/useWallet';
// import { useLoans } from '@/lib/hooks/useLoans';
// import { depositFunds, withdrawFunds } from '@/lib/actions/wallet.actions';
// import toast from 'react-hot-toast';
// import { Loader } from '@/components/ui/Loader/Loader';
// import useTransactions from '@/lib/hooks/useTransactions';

// export default function WalletPage() {
//   const router = useRouter();
//   const { balance, isLoading: walletLoading, refreshBalance } = useWallet();
//   const { eligibility, userLoans, isLoading: loansLoading } = useLoans();
//   const { transactions, isLoading: txLoading } = useTransactions();
  
//   const [isDepositing, setIsDepositing] = useState(false);
//   const [isWithdrawing, setIsWithdrawing] = useState(false);
//   const [depositAmount, setDepositAmount] = useState('');
//   const [withdrawAmount, setWithdrawAmount] = useState('');
//   const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw'>('overview');

//   const handleDeposit = async () => {
//     const amount = parseFloat(depositAmount);
//     if (isNaN(amount) || amount < 100) {
//       toast.error('Minimum deposit is KES 100');
//       return;
//     }

//     setIsDepositing(true);
//     try {
//       const result = await depositFunds({
//         amount,
//         paymentMethod: 'MPESA',
//         description: 'Wallet deposit',
//       });

//       if (!result.success) {
//         toast.error(result.error || 'Deposit failed');
//         return;
//       }

//       toast.success(`Deposit of ${formatCurrency(amount)} successful!`);
//       setDepositAmount('');
//       refreshBalance();
//     } catch (error: any) {
//       toast.error(error.message || 'Deposit failed');
//     } finally {
//       setIsDepositing(false);
//     }
//   };

//   const handleWithdraw = async () => {
//     const amount = parseFloat(withdrawAmount);
//     if (isNaN(amount) || amount < 100) {
//       toast.error('Minimum withdrawal is KES 100');
//       return;
//     }

//     if (amount > (balance?.availableBalance || 0)) {
//       toast.error('Insufficient available balance');
//       return;
//     }

//     setIsWithdrawing(true);
//     try {
//       const result = await withdrawFunds({
//         amount,
//         mpesaNumber: '0712345678',
//         description: 'Wallet withdrawal',
//       });

//       if (!result.success) {
//         toast.error(result.error || 'Withdrawal failed');
//         return;
//       }

//       toast.success(`Withdrawal of ${formatCurrency(amount)} submitted!`);
//       setWithdrawAmount('');
//       refreshBalance();
//     } catch (error: any) {
//       toast.error(error.message || 'Withdrawal failed');
//     } finally {
//       setIsWithdrawing(false);
//     }
//   };

//   const isLoading = walletLoading || loansLoading || txLoading;

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <Loader size="lg" text="Loading wallet data..." />
//       </div>
//     );
//   }

//   const loans = userLoans?.data || [];
//   const activeLoans = loans.filter((l: any) => l.status === 'ACTIVE');
//   const recentTransactions = transactions?.transactions?.slice(0, 5) || [];

//   return (
//     <div className="space-y-8">
//       <div>
//         <h1 className="text-3xl font-bold text-text">Wallet</h1>
//         <p className="text-text/60 mt-1">Manage your savings, loans, and transactions</p>
//       </div>

//       {/* Tabs */}
//       <div className="flex border-b border-primary/10">
//         <button
//           onClick={() => setActiveTab('overview')}
//           className={cn(
//             'px-6 py-3 text-sm font-medium transition-colors',
//             activeTab === 'overview'
//               ? 'text-primary border-b-2 border-primary'
//               : 'text-text/60 hover:text-text'
//           )}
//         >
//           📊 Overview
//         </button>
//         <button
//           onClick={() => setActiveTab('deposit')}
//           className={cn(
//             'px-6 py-3 text-sm font-medium transition-colors',
//             activeTab === 'deposit'
//               ? 'text-primary border-b-2 border-primary'
//               : 'text-text/60 hover:text-text'
//           )}
//         >
//           💰 Deposit
//         </button>
//         <button
//           onClick={() => setActiveTab('withdraw')}
//           className={cn(
//             'px-6 py-3 text-sm font-medium transition-colors',
//             activeTab === 'withdraw'
//               ? 'text-primary border-b-2 border-primary'
//               : 'text-text/60 hover:text-text'
//           )}
//         >
//           🏦 Withdraw
//         </button>
//       </div>

//       {/* Overview Tab */}
//       {activeTab === 'overview' && (
//         <>
//           {/* Balance Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//             <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
//               <div className="space-y-2">
//                 <p className="text-sm text-text/60">Total Balance</p>
//                 <p className="text-3xl font-bold text-primary">
//                   {formatCurrency(balance?.balance || 0)}
//                 </p>
//               </div>
//             </Card>

//             <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/30">
//               <div className="space-y-2">
//                 <p className="text-sm text-text/60">Available</p>
//                 <p className="text-3xl font-bold text-secondary">
//                   {formatCurrency(balance?.availableBalance || 0)}
//                 </p>
//               </div>
//             </Card>

//             <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30">
//               <div className="space-y-2">
//                 <p className="text-sm text-text/60">Locked</p>
//                 <p className="text-3xl font-bold text-accent">
//                   {formatCurrency(balance?.lockedBalance || 0)}
//                 </p>
//               </div>
//             </Card>

//             <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
//               <div className="space-y-2">
//                 <p className="text-sm text-text/60">Active Loans</p>
//                 <p className="text-3xl font-bold text-primary">
//                   {activeLoans.length}
//                 </p>
//               </div>
//             </Card>
//           </div>

//           {/* Quick Actions */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <Card className="border-primary/20">
//               <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
//               <div className="grid grid-cols-2 gap-3">
//                 <button
//                   onClick={() => setActiveTab('deposit')}
//                   className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all"
//                 >
//                   <span className="text-2xl">💰</span>
//                   <span className="text-sm text-text">Deposit</span>
//                 </button>
//                 <button
//                   onClick={() => setActiveTab('withdraw')}
//                   className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all"
//                 >
//                   <span className="text-2xl">🏦</span>
//                   <span className="text-sm text-text">Withdraw</span>
//                 </button>
//                 {balance?.isEligibleForLoan && (
//                   <button
//                     onClick={() => router.push('/loans')}
//                     className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all"
//                   >
//                     <span className="text-2xl">📝</span>
//                     <span className="text-sm text-text">Apply Loan</span>
//                   </button>
//                 )}
//                 <button
//                   onClick={() => router.push('/transactions')}
//                   className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all"
//                 >
//                   <span className="text-2xl">📊</span>
//                   <span className="text-sm text-text">History</span>
//                 </button>
//               </div>
//             </Card>

//             <Card className="border-primary/20">
//               <h3 className="text-lg font-bold mb-4">Loan Status</h3>
//               <div className="space-y-3">
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-text/60">Eligibility</span>
//                   <span className={cn(
//                     'text-sm font-bold',
//                     eligibility?.isEligible ? 'text-green-500' : 'text-accent'
//                   )}>
//                     {eligibility?.isEligible ? '✅ Eligible' : '⏳ Not Eligible'}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-text/60">Max Loan</span>
//                   <span className="text-sm font-bold text-primary">
//                     {formatCurrency(eligibility?.maxLoanAmount || 0)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-text/60">Savings Required</span>
//                   <span className="text-sm font-bold text-secondary">
//                     {formatCurrency(eligibility?.minSavingsRequirement || 2000)}
//                   </span>
//                 </div>
//                 {balance?.activeLoan && (
//                   <div className="mt-3 p-3 bg-accent/10 rounded-lg">
//                     <p className="text-sm text-text/60">Active Loan Balance</p>
//                     <p className="text-lg font-bold text-accent">
//                       {formatCurrency(balance.activeLoan.balance)}
//                     </p>
//                     <p className="text-xs text-text/40">
//                       Due: {formatDate(balance.activeLoan.dueDate)}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </Card>
//           </div>

//           {/* Recent Transactions */}
//           <Card className="border-primary/20">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-bold">Recent Transactions</h3>
//               <Button variant="ghost" size="sm" onClick={() => router.push('/transactions')}>
//                 View All →
//               </Button>
//             </div>
//             {recentTransactions.length === 0 ? (
//               <p className="text-text/60 text-sm">No recent transactions</p>
//             ) : (
//               <div className="space-y-3">
//                 {recentTransactions.map((tx: any) => (
//                   <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-primary/5">
//                     <div>
//                       <p className="text-sm font-medium">{tx.description || tx.type}</p>
//                       <p className="text-xs text-text/40">{formatDate(tx.createdAt)}</p>
//                     </div>
//                     <p className={cn(
//                       'text-sm font-bold',
//                       tx.type === 'DEPOSIT' || tx.type === 'LOAN_DISBURSEMENT'
//                         ? 'text-green-500'
//                         : 'text-accent'
//                     )}>
//                       {tx.type === 'DEPOSIT' || tx.type === 'LOAN_DISBURSEMENT' ? '+' : '-'}
//                       {formatCurrency(tx.amount)}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </Card>
//         </>
//       )}

//       {/* Deposit Tab */}
//       {activeTab === 'deposit' && (
//         <Card className="border-primary/20">
//           <h3 className="text-lg font-bold mb-4">Deposit Funds</h3>
//           <div className="space-y-4">
//             <p className="text-sm text-text/60">
//               Deposit money into your wallet. Minimum deposit is KES 100.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4">
//               <Input
//                 type="number"
//                 placeholder="Enter amount"
//                 value={depositAmount}
//                 onChange={(e) => setDepositAmount(e.target.value)}
//                 className="flex-1"
//               />
//               <Button
//                 onClick={handleDeposit}
//                 isLoading={isDepositing}
//                 disabled={!depositAmount || parseFloat(depositAmount) < 100}
//               >
//                 Deposit Funds
//               </Button>
//             </div>
//             <div className="flex gap-2 flex-wrap">
//               {[1000, 2000, 5000, 10000, 20000].map((amount) => (
//                 <button
//                   key={amount}
//                   onClick={() => setDepositAmount(amount.toString())}
//                   className="px-3 py-1 text-sm bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
//                 >
//                   {formatCurrency(amount)}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </Card>
//       )}

//       {/* Withdraw Tab */}
//       {activeTab === 'withdraw' && (
//         <Card className="border-primary/20">
//           <h3 className="text-lg font-bold mb-4">Withdraw Funds</h3>
//           <div className="space-y-4">
//             <p className="text-sm text-text/60">
//               Withdraw money from your wallet. Minimum withdrawal is KES 100.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4">
//               <Input
//                 type="number"
//                 placeholder="Enter amount"
//                 value={withdrawAmount}
//                 onChange={(e) => setWithdrawAmount(e.target.value)}
//                 className="flex-1"
//               />
//               <Button
//                 onClick={handleWithdraw}
//                 isLoading={isWithdrawing}
//                 variant="outline"
//                 disabled={!withdrawAmount || parseFloat(withdrawAmount) < 100}
//               >
//                 Request Withdrawal
//               </Button>
//             </div>
//             <div className="flex gap-2 flex-wrap">
//               {[1000, 2000, 5000, 10000].map((amount) => (
//                 <button
//                   key={amount}
//                   onClick={() => setWithdrawAmount(amount.toString())}
//                   className="px-3 py-1 text-sm bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
//                 >
//                   {formatCurrency(amount)}
//                 </button>
//               ))}
//             </div>
//             <p className="text-xs text-text/40">
//               Available balance: {formatCurrency(balance?.availableBalance || 0)}
//             </p>
//             {balance?.lockedBalance && balance.lockedBalance > 0 && (
//               <p className="text-xs text-text/40">
//                 Locked balance: {formatCurrency(balance.lockedBalance)} (active loan collateral)
//               </p>
//             )}
//           </div>
//         </Card>
//       )}
//     </div>
//   );
// }