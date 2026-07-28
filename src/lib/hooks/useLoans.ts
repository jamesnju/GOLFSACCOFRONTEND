import useSWR from 'swr';
import { loanApi } from '../api/loans';
import { useWallet } from './useWallet';

export function useLoans() {
  const { refreshBalance } = useWallet();

  const {
    data: eligibility,
    error: eligibilityError,
    mutate: refreshEligibility,
  } = useSWR('loan-eligibility', loanApi.checkEligibility, {
    revalidateOnFocus: true,
    dedupingInterval: 5 * 60 * 1000,
  });

  const {
    data: userLoans,
    error: loansError,
    mutate: refreshLoans,
  } = useSWR('user-loans', loanApi.getUserLoans, {
    revalidateOnFocus: true,
    dedupingInterval: 2 * 60 * 1000,
  });

  const applyForLoan = async (data: any) => {
    const result = await loanApi.apply(data);
    refreshLoans();
    refreshEligibility();
    refreshBalance();
    return result;
  };

  return {
    eligibility,
    userLoans,
    applyForLoan,
    refreshEligibility,
    refreshLoans,
    isLoading: !eligibility && !userLoans,
    error: eligibilityError || loansError,
  };
}