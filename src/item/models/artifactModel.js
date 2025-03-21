import { template_schema_base } from "./shared";

const {
  StringField,
} = foundry.data.fields;

const artifactSchema = {
  ...template_schema_base(),
  artifactType: new StringField(),

};

export class ArtifactModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return artifactSchema;
  }
}