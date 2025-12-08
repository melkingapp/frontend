import { useEffect, useRef, useState } from "react";
import UnitManagementSummary from '../../features/resident/unitManagement/components/UnitManagementSummary'
import UnitsSummary from '../../features/resident/unitManagement/components/UnitsSummary'
import RequestsSummary from "../../features/resident/unitManagement/components/RequestsSummary";
import TransactionsSummary from "../../features/resident/unitManagement/components/TransactionsSummary";
import UnitAssignmentModal from "../../features/resident/unitManagement/components/UnitAssignmentModal";
import { checkUnitAssignment } from "../../shared/services/unitManagementService";

export default function UnitManagement() {
  const unitsRef = useRef(null);
  const requestsRef = useRef(null);
  const transactionsRef = useRef(null);
  const [assignment, setAssignment] = useState({ loading: true, show: false, unit: null, role: null });

  const scrollToSection = (section) => {
    if (section === "units" && unitsRef.current) {
      unitsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (section === "requests" && requestsRef.current) {
      requestsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (section === "transactions" && transactionsRef.current) {
      transactionsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    const checkAssignment = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return setAssignment((s) => ({ ...s, loading: false }));
        const data = await checkUnitAssignment();
        const shouldShow = data.has_unit && !data.is_confirmed;
        setAssignment({ loading: false, show: shouldShow, unit: data.unit, role: data.suggested_role });
      } catch (e) {
        setAssignment((s) => ({ ...s, loading: false }));
      }
    };
    checkAssignment();
  }, []);

  return (
    <div className="space-y-6">
      <UnitManagementSummary onItemClick={scrollToSection}
        highlightableKeys={["units", "requests", "transactions"]} />

      <div ref={unitsRef}>
        <UnitsSummary />
      </div>

      <div ref={requestsRef}>
        <RequestsSummary />
      </div>

      <div ref={transactionsRef}>
        <TransactionsSummary />
      </div>

      <UnitAssignmentModal
        isOpen={assignment.show}
        unitData={assignment.unit}
        suggestedRole={assignment.role}
        onClose={() => setAssignment((s) => ({ ...s, show: false }))}
        onConfirmed={() => setAssignment((s) => ({ ...s, show: false }))}
      />
    </div>
  )
}
