import { site } from './catalogue';

// Outbound links. Until set, the maker renders as plain text and X is left out.
export const links: { maker?: string; github: string; x?: string } = {
  maker: undefined,
  github: site.repo,
  x: undefined,
};
