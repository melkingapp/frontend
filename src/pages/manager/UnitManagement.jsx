import { useRef } from 'react'
import UnitsSummary from '../../features/manager/unitManagement/components/UnitsSummary'
import RequestSummary from '../../features/manager/unitManagement/components/requests/RequestSummary';
import UnitManagmentsSummary from '../../features/manager/unitManagement/components/units/UnitManagmentsSummary';
import TransactionsSummary from '../../features/manager/unitManagement/components/transactions/TransactionsSummary';

export default function UnitManagement() {
  const unitsmanagementRef = useRef(null);
  const requestsRef = useRef(null);
  const transactionsRef = useRef(null);

  const scrollToSection = (section) => {
    if (section === "unitsmanagement" && unitsmanagementRef.current) {
      unitsmanagementRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (section === "requests" && requestsRef.current) {
      requestsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (section === "transactions" && transactionsRef.current) {
      transactionsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-6">
      <UnitsSummary onItemClick={scrollToSection}
        highlightableKeys={["unitsmanagement", "requests", "transactions"]} />


      <div ref={unitsmanagementRef}>
        <UnitManagmentsSummary />
      </div>

      <div ref={requestsRef}>
        <RequestSummary />
      </div>

      <div ref={transactionsRef}>
        <TransactionsSummary />
      </div>

    </div>
  )
}
