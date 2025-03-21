import { template_schema_base } from "./shared";

const shipAdventureSchema = {
  ...template_schema_base(),
};

export class ShipAdventureModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
  return shipAdventureSchema;
  }
}