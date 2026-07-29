import { Suspense } from 'react';
import { Loader } from '@/components/ui/Loader/Loader';
import PaymentForm from './PaymentForm';

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader size="lg" text="Loading payment page..." />
      </div>
    }>
      <PaymentForm />
    </Suspense>
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

// export default function PaymentPage() {
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