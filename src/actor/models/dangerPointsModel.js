const {
  NumberField
} = foundry.data.fields;
  
  const dangerPointsSchema = {
    points: new NumberField({ required: true, integer: true, min: 0, initial: 5 }),
  }
  
  export class DangerPointsModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
      return dangerPointsSchema;
    }
  }