import { template_schema_base } from "./shared";

const {
  HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField, BooleanField
} = foundry.data.fields;

const virtueSchema = {
  ...template_schema_base(),
};

export class VirtueModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
  return virtueSchema;
  }
}