import { generateTrait, template_schema_base, template_schema_vtraits } from "./shared";

const {
  NumberField, SchemaField
} = foundry.data.fields;
  

const monsterSchema = {
  ...template_schema_base(),
  ...template_schema_vtraits(),
  fear: generateTrait(),
}

export class MonsterModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return monsterSchema;
  }
}