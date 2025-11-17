import { useRef } from "react";
import FinanceSummary from '../../features/resident/finance/components/FinanceSummary'
import FinanceTransactionsSummary from '../../features/resident/finance/components/FinanceTransactionsSummary'
import BuildingBalanceSummary from "../../features/resident/finance/components/BuildingBalanceSummary";

export default function Finance() {
  const transactionsRef = useRef(null);
  const balanceRef = useRef(null);

  const scrollToSection = (section) => {
    if (section === "transactions" && transactionsRef.current) {
      transactionsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (section === "balance" && balanceRef.current) {
      balanceRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-6">
      <FinanceSummary onItemClick={scrollToSection}
        highlightableKeys={["transactions", "balance"]} />

      <div ref={transactionsRef}>
        <FinanceTransactionsSummary />
      </div>

      <div ref={balanceRef}>
        <BuildingBalanceSummary />
      </div>
    </div>
  )
}
