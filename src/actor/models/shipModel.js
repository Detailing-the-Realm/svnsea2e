import { template_schema_base, template_schema_details, template_schema_features } from "./shared";

const {
  NumberField,
  StringField,
  HTMLField
} = foundry.data.fields;

const shipSchema = {
  ...template_schema_base(),

  background: new StringField(),
  class: new StringField(),
  cargo: new HTMLField(),
  origin: new StringField(),
  crewstatus: new StringField(),
  wealth: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
}

export class ShipModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return shipSchema;
  }
}