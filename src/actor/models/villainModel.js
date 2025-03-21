import { template_schema_base, template_schema_details, template_schema_vtraits } from "./shared";

const {
  StringField
} = foundry.data.fields;

const villainSchema = {
  ...template_schema_base(),
  ...template_schema_details(),
  ...template_schema_vtraits(),
  servants: new StringField(),
  servants: new StringField(),
}

export class VillainModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return villainSchema;
  }
}