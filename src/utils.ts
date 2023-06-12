import { v2 } from "./v2";

export function mod(n : number, m : number) {
    return ((n % m) + m) % m;
  }

export async function delay(delayInMilliseconds: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, delayInMilliseconds));
  // Code to execute after the delay
}

export function angledistance_2d (a: v2, b: v2): number {
  const x_diff = Math.abs(fastest_way_angle(a.x, b.x))
  const y_diff = Math.abs(fastest_way_angle(a.y, b.y))
  return Math.sqrt(x_diff * x_diff + y_diff * y_diff)
}

export function fastest_way_angle (from: number, to: number): number {
  if (Math.abs(to - from) < Math.PI) {
    return to - from
  } else if (from < to) {
    return to - (from + 2 * Math.PI)
  } else {
    return to - (from - 2 * Math.PI)
  }
}

export function angle_diff(from : v2, to : v2) : v2 {
  return new v2(fastest_way_angle(from.x, to.x), fastest_way_angle(from.y, to.y))
}