import { Dashboard } from "@/features/training/components/dashboard";
import { trainingWeeks } from "@/features/training/data/training-weeks";
import { findWeek, parisDate } from "@/features/training/model/selectors";

export const dynamic = "force-dynamic";
export default function Home() {
  const today = parisDate(new Date());
  return <Dashboard today={today} week={findWeek(trainingWeeks, today)} />;
}
