// Fields. Primitives publishes one catalogue per field (design first); every field shares the
// harness and differs in its catalogue, marks and tints. The direction is in the private brief,
// primitives-design/FIELDS.md. One host is served today: the apex serves the only field, and
// design.primitiv.es redirects to it (workers/design-redirect). When a second field ships, each
// field moves to its subdomain and the apex becomes the index of fields.
import data from '@/data/catalogue.json';

export type Field = 'design';

/** The field this catalogue belongs to: catalogue.json's top-level `field`. */
export const field = data.field as Field;

// Hosts that name a field. Anything else (local development, previews) serves the catalogue's.
const hosts: Record<string, Field> = {
  'primitiv.es': 'design',
  'design.primitiv.es': 'design',
};

/** The field a request is for, by its host. */
export const fieldForHost = (hostname: string): Field => hosts[hostname] ?? field;
