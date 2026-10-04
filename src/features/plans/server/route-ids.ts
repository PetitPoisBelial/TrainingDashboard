import { parseTrainingPlanId } from "../model/validation";
import { parseWorkoutId } from "../../training/model/validation";

// Next 16.3 supplies escaped segments here, including ':' in our reserved IDs.
// Decode exactly once at the route boundary; business IDs remain opaque.
function decodeSegment(value: string): string | undefined {
  try { return decodeURIComponent(value); } catch { return undefined; }
}
export const routePlanId = (value: string) => parseTrainingPlanId(decodeSegment(value));
export const routeWorkoutId = (value: string) => parseWorkoutId(decodeSegment(value));
