import { template_schema_base } from "./shared";

const {
  SchemaField, NumberField,
} = foundry.data.fields;

const schemeSchema = {
  ...template_schema_base(),
  influence: new SchemaField({
    value: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      min: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      max: new NumberField({ required: true, integer: true, min: 0, initial: 40 })
  })
};

export class SchemeModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
  return schemeSchema;
  }
}