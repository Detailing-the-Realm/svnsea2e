import { template_schema_base } from "./shared";

const {
  StringField,
} = foundry.data.fields;

const sorcerySchema = {
  ...template_schema_base(),
  sorctype: new StringField(),
  sorcdur: new StringField(),
  sorccat: new StringField(),
  sorcsubcat: new StringField(),
};

export class SorceryModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return sorcerySchema;
  }
}