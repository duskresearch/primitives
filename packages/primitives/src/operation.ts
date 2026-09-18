/**
 * An instrument's logic, in the shape every consumer shares: the site's islands today,
 * JSON endpoints (/api/<primitive>/<instrument>) and the npm package later.
 *
 * - One plain object in, one plain object out. Both survive JSON.stringify unchanged.
 * - No DOM, no network, no clock, no randomness unless seeded: the same input always
 *   gives the same output, in a browser, a Worker or Node.
 * - Bad input throws an InputError with a message a person can act on; an endpoint
 *   turns it into a 400.
 */
export type Operation<Input extends object, Output extends object> = (input: Input) => Output;

export class InputError extends Error {
  override name = 'InputError';
}
