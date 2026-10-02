import { Dashboard } from "@/features/training/components/dashboard";
import { getTrainingWeeks } from "@/features/training/data/localized-training-weeks";
import { findWeek, parisDate } from "@/features/training/model/selectors";
import { getLocaleContext } from "@/i18n/request-locale";

export const dynamic = "force-dynamic";
export default async function Home() {
  const { locale, dictionary } = await getLocaleContext();
  const today = parisDate(new Date());
  return (
    <Dashboard
      today={today}
      week={findWeek(getTrainingWeeks(locale), today)}
      locale={locale}
      dictionary={dictionary}
    />
  );
}
