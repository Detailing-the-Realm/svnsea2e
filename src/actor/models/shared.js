const {
  HTMLField, SchemaField, NumberField, StringField, ArrayField
} = foundry.data.fields;

export const template_schema_base = () => ({
  initiative: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
  wounds: new SchemaField({
    value: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
    min: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
    max: new NumberField({ required: true, integer: true, min: 0, initial: 20 })
  }),
  dwounds: new SchemaField({
    value: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
    min: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
    max: new NumberField({ required: true, integer: true, min: 0, initial: 4 })
  }),
});

export const template_schema_details = () => ({
  nation: new StringField(),
  religion: new StringField(),
  age: new NumberField({ required: true, integer: true, min: 0, initial: 20 }),
  reputation: new StringField(),
  languages: new ArrayField(new StringField()),
  equipment: new StringField(),
  concept: new HTMLField({ initial: "<h3>Concept</h3><h3>Biography</h3>" })
});

export const template_schema_features = () => ({
  traits: new SchemaField({
    brawn: generateTrait(2),
    finesse: generateTrait(2),
    resolve: generateTrait(2),
    wits: generateTrait(2),
    panache: generateTrait(2),
  }),
  skills: new SchemaField({
    aim: generateTrait(0),
    athletics: generateTrait(0),
    brawl: generateTrait(0),
    convince: generateTrait(0),
    empathy: generateTrait(0),
    hide: generateTrait(0),
    intimidate: generateTrait(0),
    notice: generateTrait(0),
    perform: generateTrait(0),
    ride: generateTrait(0),
    sailing: generateTrait(0),
    scholarship: generateTrait(0),
    tempt: generateTrait(0),
    theft: generateTrait(0),
    warfare: generateTrait(0),
    weaponry: generateTrait(0),
  }),
});

export const template_schema_vtraits = () => ({
  traits: new SchemaField({
    influence: new SchemaField({
      value: new NumberField({ required: true, integer: true, min: 0, initial: 5 }),
        min: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        max: new NumberField({ required: true, integer: true, min: 0, initial: 20 })
    }),
    strength: new SchemaField({
      value: new NumberField({ required: true, integer: true, min: 1, initial: 5 }),
        min: new NumberField({ required: true, integer: true, min: 1, initial: 1 }),
        max: new NumberField({ required: true, integer: true, min: 0, initial: 20 })
    })
  })
});

export const generateTrait = (initial = 0) => new SchemaField({
  value: new NumberField({ required: true, integer: true, min: 0, initial }),
    min: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
    max: new NumberField({ required: true, integer: true, min: 0, initial: 5 })
});