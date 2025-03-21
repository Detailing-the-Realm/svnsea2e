import { template_schema_base } from "./shared";

const {
  HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField, BooleanField
} = foundry.data.fields;

const advantageSchema = {
  ...template_schema_base(),
  cost: new SchemaField({
    normal: new NumberField({ initial: 1, required: true }),
    reducecost: new NumberField(),
  }),
  knack: new BooleanField({ initial: false }),
  innate: new BooleanField({ initial: false }),
};

export class AdvantageModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return advantageSchema;
  }
}