export const isStepDone = (mask: number, stepIdx: number): boolean =>
  (mask & (1 << stepIdx)) !== 0;

export const countDone = (mask: number): number => {
  let c = 0;
  let m = mask;
  while (m) {
    m &= m - 1;
    c++;
  }
  return c;
};
