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
