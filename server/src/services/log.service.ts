import { Bike } from '../models/bike.model';
import { Fuel } from '../models/fuel.model';
import { Service } from '../models/service.model';
import { Maintenance } from '../models/maintenance.model';
import { ApiError } from '../utils/ApiError';

export type LogType = 'all' | 'fuel' | 'service' | 'maintenance';

export const getLogs = async (userId: string, type: LogType, bikeId: string | undefined, limit: number) => {
  // 1. Sirf is user ki bikes. Security yahin se aati hai.
  const bikes = await Bike.find({ userId }).select('brand model').lean();
  const bikeNames: Record<string, string> = {};
  bikes.forEach((b) => (bikeNames[String(b._id)] = `${b.brand} ${b.model}`));

  if (bikeId && !bikeNames[bikeId]) throw new ApiError(404, 'Bike not found');

  const filter = { bikeId: { $in: bikeId ? [bikeId] : bikes.map((b) => b._id) } };
  const take = limit + 1; // 1 extra: isse pata chalta hai aur items bache hain ya nahi
  const newestFirst = { date: -1 } as const;

  // 2. Har type ke sabse naye items
  const fuel = type === 'service' || type === 'maintenance'
    ? []
    : await Fuel.find(filter).sort(newestFirst).limit(take).lean();

  const services = type === 'fuel' || type === 'maintenance'
    ? []
    : await Service.find(filter).sort(newestFirst).limit(take).populate('maintenanceIds', 'type').lean();

  // "All" mein service wale maintenance skip, kyunki service card mein pehle se hain
  const maintenance = type === 'fuel' || type === 'service'
    ? []
    : await Maintenance.find(type === 'all' ? { ...filter, serviceId: null } : filter)
        .sort(newestFirst)
        .limit(take)
        .lean();

  // 3. Teeno ko ek jaisa shape do
  const fuelLogs = fuel.map((f) => ({
    _id: String(f._id),
    kind: 'FUEL' as const,
    bikeId: String(f.bikeId),
    bikeName: bikeNames[String(f.bikeId)],
    date: f.date,
    amount: f.totalAmount,
    litres: f.litres,
  }));

  const serviceLogs = services.map((s) => ({
    _id: String(s._id),
    kind: 'SERVICE' as const,
    bikeId: String(s.bikeId),
    bikeName: bikeNames[String(s.bikeId)],
    date: s.date,
    amount: s.totalCost,
    odometer: s.odometer,
    workshop: s.workshop,
    items: (s.maintenanceIds as any[]).map((m) => m.type),
  }));

  const maintenanceLogs = maintenance.map((m) => ({
    _id: String(m._id),
    kind: 'MAINTENANCE' as const,
    bikeId: String(m.bikeId),
    bikeName: bikeNames[String(m.bikeId)],
    date: m.date,
    amount: m.cost,
    odometer: m.odometer,
    maintenanceType: m.type,
    brand: m.brand,
    serviceId: m.serviceId ? String(m.serviceId) : undefined,
  }));

  // 4. Mila do, naye pehle, pehle `limit` items do
  const all = [...fuelLogs, ...serviceLogs, ...maintenanceLogs].sort(
    (a, b) => +new Date(b.date) - +new Date(a.date)
  );

  return {
    items: all.slice(0, limit),
    hasMore: all.length > limit, // limit se zyada mile = aur items hain
  };
};