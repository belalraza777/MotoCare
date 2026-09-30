import { Service } from '../models/service.model';
import { Maintenance } from '../models/maintenance.model';
import { ApiError } from '../utils/ApiError';
import { getBikeById, updateCurrentKm } from './bike.service';

interface MaintenanceItemInput {
  type: string;
  brand?: string;
  cost?: number;
  notes?: string;
}

interface CreateServiceInput {
  date: Date | string;
  odometer: number;
  workshop?: string;
  notes?: string;
  maintenanceItems: MaintenanceItemInput[]; // one visit can cover several items
  serviceCharge?: number; // optional, can be 0 if no charge for labor
}

// Creates a Service AND its linked Maintenance records together — the
// "workshop visit" flow: one date/odometer, several items done at once
export const createService = async (userId: string, bikeId: string, input: CreateServiceInput) => {
  await getBikeById(userId, bikeId); // ownership check

  const maintenanceDocs = await Maintenance.insertMany(
    input.maintenanceItems.map((item) => ({
      bikeId,
      type: item.type,
      brand: item.brand,
      cost: item.cost ?? 0,
      notes: item.notes,
      date: input.date,
      odometer: input.odometer,
    }))
  );

  const maintenanceIds = maintenanceDocs.map((item) => item._id);

  // Calculate final cost from maintenance items + service charge. 
  const maintenanceCost = maintenanceDocs.reduce((total, item) => total + (item.cost ?? 0), 0);

  const serviceCharge = input.serviceCharge ?? 0;

  const totalCost = maintenanceCost + serviceCharge;

  const service = await Service.create({
    bikeId,
    date: input.date,
    odometer: input.odometer,
    workshop: input.workshop,
    notes: input.notes,
    maintenanceIds,
    serviceCharge,
    totalCost,
  });

  // link each Maintenance back to this Service
  await Maintenance.updateMany(
    { _id: { $in: maintenanceDocs.map((m) => m._id) } },
    { serviceId: service._id }
  );

  await updateCurrentKm(bikeId, input.odometer);

  return service;
};

// Get all Service records for a bike, newest-first, with linked Maintenance populated
export const getBikeServices = async (userId: string, bikeId: string) => {
  await getBikeById(userId, bikeId);
  return Service.find({ bikeId }).sort({ date: -1 }).populate('maintenanceIds');
};

// Get a specific Service record for a bike, with linked Maintenance populated
export const getServiceById = async (userId: string, bikeId: string, serviceId: string) => {
  await getBikeById(userId, bikeId);
  const service = await Service.findOne({ _id: serviceId, bikeId }).populate('maintenanceIds');
  if (!service) throw new ApiError(404, 'Service record not found');
  return service;
};

// Update a specific Service record for a bike, with linked Maintenance populated
export const deleteService = async (userId: string, bikeId: string, serviceId: string) => {
  const service = await getServiceById(userId, bikeId, serviceId);
  // remove the linked Maintenance records too — they only exist as part of this visit
  await Maintenance.deleteMany({ _id: { $in: service.maintenanceIds } });
  await service.deleteOne();
  return service;
};


// Used by reminder logic: the most recent Service is the baseline for next-due
export const getLastService = async (bikeId: string) => {
  return Service.findOne({ bikeId }).sort({ date: -1, odometer: -1 });
};