import { template_schema_base } from "./shared";

const {
  HTMLField, StringField, ArrayField,
} = foundry.data.fields;

const backgroundSchema = {
  ...template_schema_base(),
  quirk: new HTMLField(),
  skills: new ArrayField(new StringField()),
  advantages: new ArrayField(new StringField()),
  nation: new StringField(),
};

export class BackgroundModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return backgroundSchema;
  }
}