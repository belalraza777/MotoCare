import { Fuel, IFuel } from '../models/fuel.model';
import { ApiError } from '../utils/ApiError';
import { getBikeById } from './bike.service';

//Create Fuel record 
export const createFuel = async (userId: string, bikeId: string, data: Partial<IFuel>) => {
  await getBikeById(userId, bikeId); // ownership check
  return Fuel.create({ ...data, bikeId });
};

//Get all Fuel records for a bike, sorted by date descending
export const getBikeFuel = async (userId: string, bikeId: string) => {
  await getBikeById(userId, bikeId);
  return Fuel.find({ bikeId }).sort({ date: -1 });
};

//Get a single Fuel record by its ID, ensuring it belongs to the specified bike and user
export const getFuelById = async (userId: string, bikeId: string, fuelId: string) => {
  await getBikeById(userId, bikeId);
  const record = await Fuel.findOne({ _id: fuelId, bikeId });
  if (!record) throw new ApiError(404, 'Fuel record not found');
  return record;
};

//Update a Fuel record by its ID, ensuring it belongs to the specified bike and user
export const updateFuel = async (userId: string, bikeId: string, fuelId: string, updates: Partial<IFuel>) => {
  const record = await getFuelById(userId, bikeId, fuelId);
  Object.assign(record, updates);
  await record.save();
  return record;
};

//Delete a Fuel record by its ID, ensuring it belongs to the specified bike and user
export const deleteFuel = async (userId: string, bikeId: string, fuelId: string) => {
  const record = await getFuelById(userId, bikeId, fuelId);
  await record.deleteOne();
  return record;
};

//Get the total fuel expense for a bike within a specified date range
// used by expense.service later — sums totalAmount within a date range
export const sumFuelExpense = async (bikeId: string, from: Date, to: Date) => {
  const result = await Fuel.aggregate([
    { $match: { bikeId, date: { $gte: from, $lte: to } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);
  return result[0]?.total ?? 0;
};