import { template_schema_base } from "./shared";

const {
  HTMLField, StringField,
} = foundry.data.fields;

const secretSocietySchema = {
  ...template_schema_base(),
  concern: new HTMLField(),
  earnfavor: new HTMLField(),
  callupon: new StringField(),
  favor: new HTMLField(),
};

export class SecretSocietyModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
  return secretSocietySchema;
  }
}