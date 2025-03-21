import { template_schema_base, template_schema_details, template_schema_features } from "./shared";

const heroSchema = {
  ...template_schema_base(),
  ...template_schema_details(),
  ...template_schema_features(),
}

export class HeroModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return heroSchema;
  }
}