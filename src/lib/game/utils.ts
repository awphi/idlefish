function boxMullerTransform() {
  const u1 = Math.random();
  const u2 = Math.random();

  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);

  return { z0, z1 };
}

export function getNormallyDistributedRandomNumber(
  mean: number,
  stddev: number
): number {
  const { z0 } = boxMullerTransform();

  return z0 * stddev + mean;
}

export function weightedRandom(weights: {
  [k: string]: { weight: number };
}): string {
  const uniformRandom = Math.random();
  let sum = 0;

  for (const [k, v] of Object.entries<{ weight: number }>(weights)) {
    sum += v.weight;
    if (uniformRandom < sum) {
      return k;
    }
  }

  return Object.keys(weights)[0];
}

export function closeTo(x: number, y: number, epsilon = 1e-2): boolean {
  return y > x - epsilon && y < x + epsilon;
}

export const worldWidth = 10000;
export const worldHeight = 10000;
export const viewportPadding = 10;
