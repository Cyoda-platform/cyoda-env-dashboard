import type { ValidationIssue } from './validateWorkflowDoc';

/** A tree node renders the red dot iff some error path equals it OR has it as a slash-bounded prefix. */
export function nodeHasError(nodePath: string, errors: ValidationIssue[]): boolean {
  return errors.some((e) => e.path === nodePath || e.path.startsWith(nodePath + '/'));
}
