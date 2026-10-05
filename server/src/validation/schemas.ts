import Joi from 'joi';

const objectId = Joi.string().hex().length(24);
const date = Joi.date().iso();
const nonNegative = Joi.number().min(0);

const bikeFields = {
  brand: Joi.string().trim().min(1).max(100),
  model: Joi.string().trim().min(1).max(100),
  variant: Joi.string().trim().max(100).allow(''),
  registrationNumber: Joi.string().trim().max(30).allow(''),
  purchaseDate: date,
  fuelType: Joi.string().valid('PETROL', 'ELECTRIC', 'DIESEL', 'HYBRID'),
  currentKm: nonNegative,
  serviceIntervalKm: nonNegative.min(1),
};

export const createBikeSchema = Joi.object({
  ...bikeFields,
  brand: bikeFields.brand.required(),
  model: bikeFields.model.required(),
  fuelType: bikeFields.fuelType.required(),
  serviceIntervalKm: bikeFields.serviceIntervalKm.required(),
});

export const updateBikeSchema = Joi.object(bikeFields).min(1);

export const maintenanceSchema = Joi.object({
  type: Joi.string().valid(
    'ENGINE_OIL', 'OIL_FILTER', 'AIR_FILTER', 'BRAKES', 'TYRE', 'BATTERY',
    'SPARK_PLUG', 'GEAR_OIL', 'COOLANT', 'CHAIN', 'CHAIN_LUBRICATION',
    'CLUTCH', 'GENERAL_CHECK', 'OTHER',
  ).required(),
  brand: Joi.string().trim().max(100).allow(''),
  date: date.required(),
  odometer: nonNegative.required(),
  cost: nonNegative,
  notes: Joi.string().trim().max(1000).allow(''),
});

export const updateMaintenanceSchema = maintenanceSchema.fork(
  ['type', 'date', 'odometer'],
  (schema) => schema.optional(),
).min(1);

export const fuelSchema = Joi.object({
  date: date.required(),
  litres: Joi.number().positive().required(),
  totalAmount: nonNegative.required(),
});

export const updateFuelSchema = fuelSchema.fork(
  ['date', 'litres', 'totalAmount'],
  (schema) => schema.optional(),
).min(1);

const maintenanceItemSchema = Joi.object({
  type: Joi.string().valid(
    'ENGINE_OIL', 'OIL_FILTER', 'AIR_FILTER', 'BRAKES', 'TYRE', 'BATTERY',
    'SPARK_PLUG', 'GEAR_OIL', 'COOLANT', 'CHAIN', 'CHAIN_LUBRICATION',
    'CLUTCH', 'GENERAL_CHECK', 'OTHER',
  ).required(),
  brand: Joi.string().trim().max(100).allow(''),
  cost: nonNegative,
  notes: Joi.string().trim().max(1000).allow(''),
});

export const serviceSchema = Joi.object({
  date: date.required(),
  odometer: nonNegative.required(),
  workshop: Joi.string().trim().max(200).allow(''),
  notes: Joi.string().trim().max(1000).allow(''),
  serviceCharge: nonNegative,
  maintenanceItems: Joi.array().items(maintenanceItemSchema).min(1).required(),
});

export const documentSchema = Joi.object({
  type: Joi.string().valid('INSURANCE', 'PUC', 'RC', 'OTHER').required(),
  title: Joi.string().trim().max(200).allow(''),
  issueDate: date,
  expiryDate: date.required(),
  policyNumber: Joi.string().trim().max(100).allow(''),
  company: Joi.string().trim().max(200).allow(''),
  insuredAmount: nonNegative,
  certificateNumber: Joi.string().trim().max(100).allow(''),
}).custom((value, helpers) => {
  if (value.type === 'OTHER' && !value.title?.trim()) {
    return helpers.error('any.custom', { message: '"title" is required for OTHER documents' });
  }
  return value;
});

export const bikeIdParamsSchema = Joi.object({ id: objectId.required() });
export const nestedBikeIdParamsSchema = Joi.object({ bikeId: objectId.required() });
export const maintenanceIdParamsSchema = nestedBikeIdParamsSchema.keys({
  maintenanceId: objectId.required(),
});
export const fuelIdParamsSchema = nestedBikeIdParamsSchema.keys({
  fuelId: objectId.required(),
});
export const serviceIdParamsSchema = nestedBikeIdParamsSchema.keys({
  serviceId: objectId.required(),
});
export const documentIdParamsSchema = nestedBikeIdParamsSchema.keys({
  documentId: objectId.required(),
});
