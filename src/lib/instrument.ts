// The contract every instrument's meta.ts fulfils. Name, number, pain, keywords and
// primaryValue come from catalogue.json; meta.ts adds what the catalogue does not hold.
export interface InstrumentMeta {
  /** One sentence shown beside the title, above the tool. */
  purpose: string;
  /** Status label when `C` copies the primary value: "Copied <primaryLabel>". */
  primaryLabel: string;
  /** Related instruments: a slug in the same primitive, or "primitive/slug". */
  related: string[];
}

export const defineInstrument = (meta: InstrumentMeta) => meta;
