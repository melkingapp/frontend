import { useRef } from "react";
import NotificationsSummary from '../../features/resident/notification/components/NotificationsSummary'
import BuildingNewsSummary from '../../features/resident/notification/components/letter/BuildingNewsSummary'
import ServicesSummary from "../../features/resident/notification/components/service/ServicesSummary";
import SurveySummary from "../../features/resident/notification/components/survey/SurveySummary";

export default function Notifications() {
  const newsRef = useRef(null);
  const servicesRef = useRef(null);
  const surveyRef = useRef(null);

  const scrollToSection = (section) => {
    if (section === "news" && newsRef.current) {
      newsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (section === "services" && servicesRef.current) {
      servicesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (section === "surveys" && surveyRef.current) {
      surveyRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-6">
      <NotificationsSummary onItemClick={scrollToSection}
        highlightableKeys={["news", "services", "surveys"]} />

      <div ref={newsRef}>
        <BuildingNewsSummary />
      </div>

      <div ref={servicesRef}>
        <ServicesSummary />
      </div>

      <div ref={surveyRef}>
        <SurveySummary />
      </div>
    </div>
  )
}
