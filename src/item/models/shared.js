const {
  HTMLField, StringField,
} = foundry.data.fields;

export const template_schema_base = () => ({
  description: new HTMLField(),
  infosource: new StringField(),
})