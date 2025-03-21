import { template_schema_base } from "./shared";

const monsterQualitySchema = {
  ...template_schema_base(),
};

export class MonsterQualityModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
  return monsterQualitySchema;
  }
}