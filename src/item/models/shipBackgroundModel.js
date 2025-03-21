import { template_schema_base } from "./shared";

const shipBackgroundSchema = {
  ...template_schema_base(),
};

export class ShipBackgroundModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
  return shipBackgroundSchema;
  }
}