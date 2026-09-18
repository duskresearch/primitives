// On-screen helpers the Color tools share.
import { fromHex, ratio, type Lch } from '@duskresearch/primitives/design/color';
import tokens from '@/data/tokens.json';

const ink = fromHex(tokens.color.ink)!;
const paper = fromHex(tokens.color.paper)!;

/** Ink or paper, whichever reads better on the color: labels sit on the colors they name. */
export const textOn = (c: Lch) => (ratio(ink, c) >= ratio(paper, c) ? tokens.color.ink : tokens.color.paper);
