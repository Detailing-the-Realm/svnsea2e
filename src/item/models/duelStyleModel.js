import { template_schema_base } from "./shared";

const {
  HTMLField,
} = foundry.data.fields;

const duelStyleSchema = {
  ...template_schema_base(),
  bonus: new HTMLField(),
};

export class DuelStyleModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return duelStyleSchema;
  }
}