'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';
import { initiatePayment } from '@/lib/actions/payment.actions';
import {
  ShieldCheckIcon,
  ClockIcon,
  PhoneIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import { getCurrentUser } from '@/lib/auth/auth.actions';
import { Loader } from '@/components/ui/Loader/Loader';

const REGISTRATION_FEE = 1000;

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Check if user is already active
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData);
          if (userData.isActive) {
            toast.success('Your account is already active!');
            router.push('/dashboard');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking user status:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkUserStatus();
  }, [router]);

  const handlePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      const result = await initiatePayment({
        phoneNumber,
        amount: REGISTRATION_FEE,
        purpose: 'REGISTRATION',
      });

      if (!result.success) {
        toast.error(result.error || 'Payment initiation failed');
        return;
      }

      toast.success('Payment initiated! Please check your phone for M-Pesa prompt.');
      
      setTimeout(() => {
        router.push('/payment/success');
      }, 5000);
    } catch (error: any) {
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader size="lg" text="Checking account status..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-background">
      <Card className="w-full max-w-4xl overflow-hidden border-primary/20 shadow-2xl shadow-primary/5">
        <div className="flex flex-col lg:flex-row min-h-[550px] lg:min-h-[600px]">
          
          {/* Left Side - Brand/Info Section */}
          <div className="relative lg:w-2/5 p-8 sm:p-10 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/20 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-accent/20 blur-2xl" />
            
            <div className="relative z-10">
              {/* Icon */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                <CreditCardIcon className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-heading font-bold leading-tight mb-3">
                Activate Your{' '}
                <span className="text-primary">Account</span>
              </h2>
              <p className="text-sm sm:text-base text-text/60 mb-6">
                Pay the registration fee to unlock full access to Golf SACCO features.
              </p>

              {/* Benefits */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-text/60">Instant account activation</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-text/60">Access to savings and loans</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-text/60">Join the golf community</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-2 pt-4 border-t border-primary/10">
                <ShieldCheckIcon className="w-4 h-4 text-primary" />
                <span className="text-xs text-text/40">Secure payment via M-Pesa</span>
              </div>
            </div>
          </div>

          {/* Right Side - Payment Form */}
          <div className="lg:w-3/5 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-background/30">
            <div className="w-full max-w-sm mx-auto">
              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-text">
                  Registration Fee
                </h3>
                <p className="text-sm text-text/50 mt-1">
                  One-time payment to activate your account
                </p>
              </div>

              {/* User Email */}
              {email && (
                <div className="mb-6 p-3 sm:p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <p className="text-xs text-text/40">Account Email</p>
                  <p className="text-sm font-medium text-text truncate">{email}</p>
                </div>
              )}

              {/* Fee Display */}
              <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text/60">Registration Fee</span>
                  <span className="text-2xl sm:text-3xl font-bold text-primary">
                    {formatCurrency(REGISTRATION_FEE)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <ClockIcon className="w-3 h-3 text-text/30" />
                  <span className="text-xs text-text/30">One-time payment</span>
                </div>
              </div>

              {/* Phone Input */}
              <div className="space-y-1.5 mb-6">
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
                    className="pl-10 bg-background/50 border-primary/20 focus:border-primary/50 rounded-xl"
                    helperText="Enter the phone number registered with M-Pesa"
                  />
                </div>
              </div>

              {/* Pay Button */}
              <Button
                onClick={handlePayment}
                isLoading={isLoading}
                fullWidth
                size="lg"
                disabled={!phoneNumber || phoneNumber.length < 10}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-background font-semibold py-3 sm:py-4 rounded-xl transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40"
              >
                {isLoading ? 'Processing...' : 'Pay with M-Pesa'}
                {!isLoading && <ArrowRightIcon className="w-5 h-5 ml-2" />}
              </Button>

              {/* Info Text */}
              <p className="text-xs text-text/30 text-center mt-4">
                You will receive an M-Pesa prompt on your phone to complete the payment
              </p>

              {/* Links */}
              <div className="mt-6 pt-4 border-t border-primary/10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
                  <span className="text-text/40">Need help?</span>
                  <Link href="/contact" className="text-primary hover:text-primary/80 transition-colors">
                    Contact Support
                  </Link>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm mt-2">
                  <span className="text-text/40">Already paid?</span>
                  <Link href="/login" className="text-primary hover:text-primary/80 transition-colors">
                    Sign in →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Link from 'next/link';
// import { Card } from '@/components/ui/Card';
// import { Button } from '@/components/ui/Button';
// import { Input } from '@/components/ui/Input';
// import { formatCurrency } from '@/lib/utils/helpers';
// import toast from 'react-hot-toast';
// import { getCurrentUser } from '@/lib/auth/auth.actions';
// import { Loader } from '@/components/ui/Loader/Loader';
// import { initiatePayment } from '@/lib/actions/payment.actions';

// const REGISTRATION_FEE = 1000;

// export default function PaymentForm() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const email = searchParams.get('email');
  
//   const [isLoading, setIsLoading] = useState(false);
//   const [isChecking, setIsChecking] = useState(true);
//   const [user, setUser] = useState<any>(null);
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [paymentPurpose, setPaymentPurpose] = useState('REGISTRATION');

//   // Check if user is already active
//   useEffect(() => {
//     const checkUserStatus = async () => {
//       try {
//         const userData = await getCurrentUser();
//         if (userData) {
//           setUser(userData);
//           // If user is already active, redirect to dashboard
//           if (userData.isActive) {
//             toast.success('Your account is already active!');
//             router.push('/dashboard');
//             return;
//           }
//         }
//       } catch (error) {
//         console.error('Error checking user status:', error);
//       } finally {
//         setIsChecking(false);
//       }
//     };

//     checkUserStatus();
//   }, [router]);

//   const handlePayment = async () => {
//     if (!phoneNumber || phoneNumber.length < 10) {
//       toast.error('Please enter a valid phone number');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const result = await initiatePayment({
//         phoneNumber,
//         amount: REGISTRATION_FEE,
//         purpose: 'REGISTRATION',
//       });

//       if (!result.success) {
//         toast.error(result.error || 'Payment initiation failed');
//         return;
//       }

//       toast.success('Payment initiated! Please check your phone for M-Pesa prompt.');
      
//       // Poll for payment status or redirect to confirmation
//       setTimeout(() => {
//         router.push('/payment/success');
//       }, 5000);
//     } catch (error: any) {
//       toast.error(error.message || 'Payment failed. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isChecking) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-background">
//         <Loader size="lg" text="Checking account status..." />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
//       <Card className="w-full max-w-md p-8 border-primary/20">
//         <div className="text-center mb-8">
//           <span className="text-5xl block mb-4">💳</span>
//           <h1 className="text-3xl font-bold text-primary">Registration Fee</h1>
//           <p className="text-text/60 mt-2">
//             Pay KES {formatCurrency(REGISTRATION_FEE)} to activate your account
//           </p>
//         </div>

//         {email && (
//           <div className="mb-6 p-4 bg-primary/10 rounded-lg">
//             <p className="text-sm text-text/60">Account Email</p>
//             <p className="text-sm font-medium text-text">{email}</p>
//           </div>
//         )}

//         <div className="space-y-6">
//           <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
//             <div className="flex items-center justify-between">
//               <span className="text-text/60">Registration Fee</span>
//               <span className="text-2xl font-bold text-primary">
//                 {formatCurrency(REGISTRATION_FEE)}
//               </span>
//             </div>
//             <p className="text-xs text-text/40 mt-2">
//               One-time payment to activate your Golf SACCO account
//             </p>
//           </div>

//           <Input
//             label="M-Pesa Phone Number"
//             type="tel"
//             placeholder="0712345678"
//             value={phoneNumber}
//             onChange={(e) => setPhoneNumber(e.target.value)}
//             helperText="Enter the phone number registered with M-Pesa"
//           />

//           <Button
//             onClick={handlePayment}
//             isLoading={isLoading}
//             fullWidth
//             size="lg"
//             disabled={!phoneNumber || phoneNumber.length < 10}
//           >
//             {isLoading ? 'Processing...' : 'Pay with M-Pesa'}
//           </Button>

//           <div className="text-center">
//             <p className="text-xs text-text/40">
//               You will receive an M-Pesa prompt on your phone to complete the payment
//             </p>
//           </div>

//           <div className="mt-6 pt-6 border-t border-primary/10">
//             <div className="flex items-center justify-between text-sm">
//               <span className="text-text/60">Need help?</span>
//               <Link href="/contact" className="text-primary hover:text-primary/80 transition-colors">
//                 Contact Support
//               </Link>
//             </div>
//             <div className="flex items-center justify-between text-sm mt-2">
//               <span className="text-text/60">Already paid?</span>
//               <Link href="/login" className="text-primary hover:text-primary/80 transition-colors">
//                 Sign in
//               </Link>
//             </div>
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// }