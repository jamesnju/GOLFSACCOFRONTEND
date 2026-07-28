import { Suspense } from 'react';
import { getUserLoans, checkLoanEligibility } from '@/lib/actions/loan.actions';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate, cn, getStatusColor } from '@/lib/utils/helpers';
import Link from 'next/link';
import { LoanApplicationForm } from '@/components/forms/LoanApplicationForm';
import { Loader } from '@/components/ui/Loader/Loader';

export default async function PlayerLoansPage() {
  const [loansResult, eligibilityResult] = await Promise.all([
    getUserLoans(),
    checkLoanEligibility(),
  ]);

  const loans = loansResult.success ? loansResult.data || [] : [];
  const eligibility = eligibilityResult.success ? eligibilityResult.data : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text">My Loans</h1>
        <p className="text-text/60 mt-1">Apply for loans and track your applications</p>
      </div>

      {/* Eligibility Card */}
      <Card className="border-primary/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Loan Eligibility</h3>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-text/60">
                Status: {eligibility?.isEligible ? '✅ Eligible' : '⏳ Not Eligible'}
              </p>
              {eligibility && (
                <>
                  <p className="text-sm text-text/60">
                    Savings Balance: {formatCurrency(eligibility.savingsBalance)}
                  </p>
                  <p className="text-sm text-text/60">
                    Max Loan Amount: {formatCurrency(eligibility.maxLoanAmount)}
                  </p>
                  {!eligibility.isEligible && (
                    <p className="text-sm text-accent">
                      You need at least {formatCurrency(eligibility.minSavingsRequirement)} in savings
                      {eligibility.joinDate && ` and to be a member for 6 months (joined: ${formatDate(eligibility.joinDate)})`}
                    </p>
                  )}
                  {eligibility.hasActiveLoan && (
                    <p className="text-sm text-accent">You have an active loan</p>
                  )}
                </>
              )}
            </div>
          </div>
          {eligibility?.isEligible && !eligibility.hasActiveLoan && (
            <Link href="#apply-loan">
              <Button size="lg">Apply for Loan</Button>
            </Link>
          )}
        </div>
      </Card>

      {/* Apply for Loan Section */}
      {eligibility?.isEligible && !eligibility.hasActiveLoan && (
        <Card className="border-primary/20" id="apply-loan">
          <h3 className="text-lg font-bold mb-4">Apply for a Loan</h3>
          <LoanApplicationForm />
        </Card>
      )}

      {/* Loan History */}
      <Card className="border-primary/20">
        <h3 className="text-lg font-bold mb-4">Loan History</h3>
        <Suspense fallback={<Loader size="sm" />}>
          {loans.length === 0 ? (
            <p className="text-text/60 text-sm">No loan applications yet</p>
          ) : (
            <div className="space-y-4">
              {loans.map((loan: any) => (
                <div
                  key={loan.id}
                  className="p-4 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-primary">
                          #{loan.id.slice(0, 8)}
                        </span>
                        <span
                          className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            getStatusColor(loan.status)
                          )}
                        >
                          {loan.status}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm">
                          Amount: <span className="font-bold">{formatCurrency(loan.amount)}</span>
                        </p>
                        <p className="text-sm text-text/60">
                          Total Amount: {formatCurrency(loan.totalAmount)}
                        </p>
                        <p className="text-sm text-text/60">
                          Remaining Balance: {formatCurrency(loan.balance)}
                        </p>
                        {loan.purpose && (
                          <p className="text-sm text-text/60">Purpose: {loan.purpose}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-text/60">
                        Applied: {formatDate(loan.applicationDate)}
                      </p>
                      {loan.approvalDate && (
                        <p className="text-sm text-text/60">
                          Approved: {formatDate(loan.approvalDate)}
                        </p>
                      )}
                      {loan.dueDate && (
                        <p className="text-sm text-text/60">
                          Due: {formatDate(loan.dueDate)}
                        </p>
                      )}
                      {loan.repaidAt && (
                        <p className="text-sm text-text/60 text-green-500">
                          Repaid: {formatDate(loan.repaidAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Repayments */}
                  {loan.repayments && loan.repayments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-primary/10">
                      <p className="text-sm font-medium text-text/60 mb-2">Repayments</p>
                      <div className="space-y-2">
                        {loan.repayments.map((repayment: any) => (
                          <div
                            key={repayment.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-text/60">
                              {formatDate(repayment.createdAt)}
                            </span>
                            <span className="text-green-500 font-bold">
                              +{formatCurrency(repayment.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Suspense>
      </Card>
    </div>
  );
}