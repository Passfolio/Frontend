export function getRevealDelayClassName(index: number): string {
  if (index === 0) return 'delay-100';
  if (index === 1) return 'delay-200';
  return 'delay-300';
}
