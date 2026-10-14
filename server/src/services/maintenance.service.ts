import { Maintenance, IMaintenance } from '../models/maintenance.model';
import { ApiError } from '../utils/ApiError';
import { updateCurrentKm } from './bike.service';
import { getBikeById } from './bike.service';

//Creates a new maintenance record 
export const createMaintenance = async (
    userId: string,
    bikeId: string,
    data: Partial<IMaintenance>
) => {
    // Ensures the bike exists AND belongs to this user before allowing writes to it
    await getBikeById(userId, bikeId);

    const maintenance = await Maintenance.create({ ...data, bikeId });

    // Keep Bike.currentKm in sync when a newly logged reading is higher.
    if (data.odometer !== undefined) {
        await updateCurrentKm(bikeId, data.odometer);
    }

    return maintenance;
};

//Get all maintenance records for a bike
export const getBikeMaintenance = async (userId: string, bikeId: string) => {
    await getBikeById(userId, bikeId); // ownership check
    return Maintenance.find({ bikeId }).sort({ date: -1 });
};

//Get a single maintenance record by its ID
export const getMaintenanceById = async (userId: string, bikeId: string, maintenanceId: string) => {
    await getBikeById(userId, bikeId);
    const record = await Maintenance.findOne({ _id: maintenanceId, bikeId });
    if (!record) throw new ApiError(404, 'Maintenance record not found');
    return record;
};

//Update a maintenance record by its ID
export const updateMaintenance = async (
    userId: string,
    bikeId: string,
    maintenanceId: string,
    updates: Partial<IMaintenance>
) => {

    await getBikeById(userId, bikeId);

    // Find the existing maintenance record and update it
    const record = await getMaintenanceById(userId, bikeId, maintenanceId);
    Object.assign(record, updates); // merge updates into the existing record like [ ...record, ...updates ] would do for a plain object
    await record.save();

    if (updates.odometer !== undefined) {
        await updateCurrentKm(bikeId, updates.odometer);
    }

    return record;
};

//Delete a maintenance record by its ID
export const deleteMaintenance = async (userId: string, bikeId: string, maintenanceId: string) => {
    const record = await getMaintenanceById(userId, bikeId, maintenanceId);
    await record.deleteOne();
    return record;
};

// Used by reminder.service later: finds the most recent Maintenance of a
// given type, which is the "last done" baseline for computing next-due
export const getLastMaintenanceOfType = async (bikeId: string, type: IMaintenance['type']) => {
    return Maintenance.findOne({ bikeId, type }).sort({ date: -1, odometer: -1 });
};