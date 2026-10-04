import type { LocalDate } from "../../training/model/types";
import { isLocalDate } from "../../training/model/validation";
import { weekStart } from "../../training/model/selectors";
import { planStatus, planTotals, planWeeks } from "./selectors";
import type { TrainingPlan, TrainingPlanId } from "./types";

export function planSummary(plan: TrainingPlan, activeId: TrainingPlanId | null, today: LocalDate) {
  return { id: plan.id, name: plan.name, description: plan.description,
    startsOn: plan.startsOn, endsOn: plan.endsOn, status: planStatus(plan, today),
    active: plan.id === activeId, totals: planTotals(plan) };
}
export type PlanSummary = ReturnType<typeof planSummary>;

// Invalid, repeated or outside-plan parameters visibly fall back to the first week.
export function selectPlanWeek(plan: TrainingPlan, requested: string | string[] | undefined, today: LocalDate) {
  const weeks = planWeeks(plan);
  const date = requested === undefined ? today : typeof requested === "string" && isLocalDate(requested) ? requested : undefined;
  const index = date ? weeks.findIndex((week) => week.startsOn === weekStart(date)) : -1;
  const selected = index < 0 ? 0 : index;
  return { week: weeks[selected], previous: weeks[selected - 1]?.startsOn,
    next: weeks[selected + 1]?.startsOn, invalid: requested !== undefined && index < 0 };
}
