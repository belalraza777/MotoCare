import { Bike } from '../models/bike.model';
import { ApiError } from '../utils/ApiError';
import { Types } from 'mongoose';

//Create a new bike for a user
export const createBike = async (userId: string, data: any) => {
  const bike = await Bike.create({
    ...data,
    userId,
    currentKm: data.currentKm ?? 0,
  });
  return bike;
};

// Get all bikes for a user, sorted by creation date (newest first)
export const getUserBikes = async (userId: string) => {
  return Bike.find({ userId }).sort({ createdAt: -1 });
};

// Get a specific bike for a user by bikeId
export const getBikeById = async (userId: string, bikeId: string) => {
  const bike = await Bike.findOne({ _id: bikeId, userId });
  if (!bike) throw new ApiError(404, 'Bike not found');
  return bike;
};

// Update a specific bike for a user by bikeId
export const updateBike = async (userId: string, bikeId: string, updates: any) => {
  const bike = await getBikeById(userId, bikeId);

  // enforce currentKm rule: never allow it to move backwards
  if (updates.currentKm !== undefined) {
    if (updates.currentKm < bike.currentKm) {
      throw new ApiError(400, `currentKm cannot be less than existing value (${bike.currentKm})`);
    }
  }

  Object.assign(bike, updates);
  await bike.save();
  return bike;
};

// Delete a specific bike for a user by bikeId
export const deleteBike = async (userId: string, bikeId: string) => {
  const bike = await getBikeById(userId, bikeId);
  await bike.deleteOne();
  return bike;
};

// Used internally by other services (Maintenance/Service creation) to update currentKm
export const updateCurrentKm = async (bikeId: Types.ObjectId | string, odometer: number) => {
  const bike = await Bike.findById(bikeId);
  if (!bike) throw new ApiError(404, 'Bike not found');

  if (odometer < bike.currentKm) {
    throw new ApiError(400, `Odometer (${odometer}) cannot be less than bike's current KM (${bike.currentKm})`);
  }

  if (odometer > bike.currentKm) {
    bike.currentKm = odometer;
    await bike.save();
  }

  return bike;
};