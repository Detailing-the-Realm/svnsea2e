import { template_schema_base } from "./shared";

const {
  HTMLField, StringField,
} = foundry.data.fields;

const storySchema = {
  ...template_schema_base(),
  reward: new HTMLField(),
  endings: new HTMLField(),
  steps: new HTMLField(),
  status: new StringField({ initial: 'current' }),
};

export class StoryModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return storySchema;
  }
}