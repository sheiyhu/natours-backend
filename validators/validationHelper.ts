import Joi from 'joi';

export abstract class ValidationHelper {
  /**
   * Validates data using specified schema and returns an array of error messages or undefined
   * @param {Object} data The data to validate
   * @param {Joi.Schema} schema The schema to validate the data with
   */
  public static async validate(data: any, schema: Joi.Schema) {
    const opts = {
      allowUnknown: true, // allow unknown keys that will be ignored
      stripUnknown: true, // remove unknown keys from the validated data
      abortEarly: false, // validate all inputs before flagging error
    };
    const { error, value } = schema.validate(data, opts);

    if (!error) {
      return value;
    }
    const message = error.details.map((items) =>
      items.message.replace(/['"]/g, '')
    );
    throw new Error(`Invalid parameter(s) \n ${message}`);
  }
}
