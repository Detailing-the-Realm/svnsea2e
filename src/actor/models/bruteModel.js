const {
  HTMLField, SchemaField, NumberField, StringField,
} = foundry.data.fields;

const bruteSchema = {
  wounds: new SchemaField({
    value: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
    min: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
    max: new NumberField({ required: true, integer: true, min: 0, initial: 20 })
  }),
  traits: new SchemaField({
    strength: new SchemaField({
      value: new NumberField({ required: true, integer: true, min: 1, initial: 5 }),
      min: new NumberField({ required: true, integer: true, min: 1, initial: 1 }),
      max: new NumberField({ required: true, integer: true, min: 1, initial: 20 })
    })
  }),
  ability: new SchemaField({
    name: new StringField(),
    description: new HTMLField()
  })
}

export class BruteModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return bruteSchema;
  }
}