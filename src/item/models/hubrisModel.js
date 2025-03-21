import { template_schema_base } from "./shared";

const hubrisSchema = {
  ...template_schema_base(),
};

export class HubrisModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
  return hubrisSchema;
  }
}