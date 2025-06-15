import React, { useMemo, useCallback } from 'react';
import { BoxProps } from '@mui/material'; // assume that Material-UI was being used because of BoxProps

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // fixed: add missing property
}

interface FormattedWalletBalance extends WalletBalance {
  // use extend to avoid duplicate properties
  formatted: string;
}

interface Props extends BoxProps {
  // should add specific props instead of empty interface
}

// define blockchain priorities as const for better type safety
const BLOCKCHAIN_PRIORITIES = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
} as const;

type SupportedBlockchain = keyof typeof BLOCKCHAIN_PRIORITIES;

const WalletPage: React.FC<Props> = (props: Props) => {
  const { ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // fixed:memoize this function
  const getPriority = useCallback((blockchain: string): number => {
    return BLOCKCHAIN_PRIORITIES[blockchain as SupportedBlockchain] || -99;
  }, []);

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        // fixed: keep balances with priority > -99 AND amount > 0 and use the correct variable name
        return balancePriority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);

        if (leftPriority !== rightPriority) {
          return rightPriority - leftPriority; // descending order
        }

        // fallback: sort by amount if priorities are equal
        return rhs.amount - lhs.amount;
      });
  }, [balances, getPriority]); // fixed: added missing dependency

  const formattedBalances = useMemo(() => {
    return sortedBalances.map(
      (balance: WalletBalance): FormattedWalletBalance => ({
        ...balance,
        formatted: balance.amount.toFixed(2), // improved: added precision for better formatting
      }),
    );
  }, [sortedBalances]);

  const rows = useMemo(() => {
    return formattedBalances.map((balance: FormattedWalletBalance) => {
      // fixed: use correct type for balance
      const usdValue = prices[balance.currency] * balance.amount;

      return (
        <WalletRow
          className="wallet-row" // fixed: undefined classes reference
          key={`${balance.currency}-${balance.blockchain}`} // improved: better key
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    });
  }, [formattedBalances, prices]);

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;

// Need to add those implementations to make the code runnable, just the example
const useWalletBalances = () => {
  /* implementation */
};
const usePrices = () => {
  /* implementation */
};

// WalletRow component example (this would need to be imported or implemented)
interface WalletRowProps {
  className: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}

const WalletRow: React.FC<WalletRowProps> = ({ className, amount, usdValue, formattedAmount }) => {
  return (
    <div className={className}>
      <span>Amount: {formattedAmount}</span>
      <span>USD Value: ${usdValue.toFixed(2)}</span>
    </div>
  );
};
