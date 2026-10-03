import type { PlanIssue } from "../model/errors";

export class PersistenceError extends Error {
  constructor(readonly code: "persistence.invalid-data" | "persistence.failure" | "persistence.state-missing") {
    super(code);
  }
}
export class InvalidPlanError extends Error {
  readonly code = "plan.invalid";
  constructor(readonly issues: readonly PlanIssue[]) { super("plan.invalid"); }
}
export class RevisionConflictError extends Error {
  readonly code = "revision.conflict";
  constructor(readonly entity: "plan" | "application-state", readonly expectedRevision: number) {
    super("revision.conflict");
  }
}
