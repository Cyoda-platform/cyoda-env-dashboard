import { useQuery } from '@tanstack/react-query';
import { getWorkflowGateway, type ModelRef } from '../../gateways';

/**
 * Resolves the workflow name for an entity instance. If the URL provides one,
 * uses it directly. Otherwise lists the workflows for the model and returns
 * the first active workflow's name (or the first one if none are active, or
 * undefined if the model has no workflows).
 */
export function useResolvedWorkflowName(
  modelRef: ModelRef | null,
  urlWorkflowName: string | undefined,
): { workflowName: string | undefined; isLoading: boolean } {
  const explicit = urlWorkflowName && urlWorkflowName.length > 0 ? urlWorkflowName : undefined;
  const query = useQuery({
    queryKey: ['cloud-instances', 'resolve-workflow', modelRef],
    queryFn: () => getWorkflowGateway().listWorkflows(modelRef!),
    enabled: !explicit && modelRef !== null,
  });
  if (explicit) return { workflowName: explicit, isLoading: false };
  if (query.isLoading) return { workflowName: undefined, isLoading: true };
  const list = query.data ?? [];
  const active = list.find((w: any) => w.active) ?? list[0];
  return { workflowName: active?.name, isLoading: false };
}
