import { Bike } from '../models/bike.model';
import { Service } from '../models/service.model';
import { Maintenance } from '../models/maintenance.model';
import { Fuel } from '../models/fuel.model';
import { Document, IDocument } from '../models/document.model';
import { getBikeById } from './bike.service';
import { getDocumentStatus } from './document.service';
import { Types } from 'mongoose';

//Due soon threshold for service in kilometers
const DUE_SOON_THRESHOLD_KM = 300;

//Helper function to get the start of the current month like 2024-06-01T00:00:00.000Z
function startOfMonth(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}


// Baseline is the last real Service if one exists, otherwise currentKm —
// so a bike with no service history still gets a sane next-due estimate
async function getServiceDueInfo(bike: InstanceType<typeof Bike>) {
  const lastService = await Service.findOne({ bikeId: bike._id }).sort({ date: -1, odometer: -1 });
  const baselineKm = lastService?.odometer ?? bike.currentKm;
  const nextDueKm = baselineKm + bike.serviceIntervalKm;
  const remainingKm = Math.max(nextDueKm - bike.currentKm, 0);
  const status = nextDueKm <= bike.currentKm ? 'overdue' : remainingKm <= DUE_SOON_THRESHOLD_KM ? 'due_soon' : 'normal';

  return { lastServiceDate: lastService?.date ?? null, nextDueKm, remainingKm, status };
}

// One $facet query per collection — computes "this month" and "total" sums
// together in a single DB round-trip instead of two separate queries
//parameter : model: Mongoose model to query, match: filter criteria, field: field to sum, monthStart: start of current month
function sumWithMonthlyFacet(model: any, match: Record<string, any>, field: string, monthStart: Date) {
  return model.aggregate([
    { $match: match }, // Match the documents that meet the criteria
    {
      $facet: { //facet allows us to compute multiple aggregations in one query
        total: [{ $group: { _id: null, sum: { $sum: `$${field}` } } }],
        thisMonth: [
          { $match: { date: { $gte: monthStart } } },
          { $group: { _id: null, sum: { $sum: `$${field}` } } },
        ],
      },
    },
  ]);
}

// Helper function to extract the sum from the facet result
const extractSum = (facetResult: any[], key: 'total' | 'thisMonth') => facetResult[0]?.[key]?.[0]?.sum ?? 0;

// Computes the total and this-month expenses for fuel, service, and maintenance
async function getExpenseSummary(bikeId: string) {
   const monthStart= startOfMonth();
  const bikeObjectId = new Types.ObjectId(bikeId);

  const [fuel, service, maintenance] = await Promise.all([
    sumWithMonthlyFacet(Fuel, { bikeId: bikeObjectId }, 'totalAmount', monthStart),
    sumWithMonthlyFacet(Service, { bikeId: bikeObjectId }, 'totalCost', monthStart),
    sumWithMonthlyFacet(
      Maintenance,
      { bikeId: bikeObjectId, serviceId: null },
      'cost',
      monthStart
    ),
  ]);

  return {
    thisMonth: extractSum(fuel, 'thisMonth') + extractSum(service, 'thisMonth') + extractSum(maintenance, 'thisMonth'),
    total: extractSum(fuel, 'total') + extractSum(service, 'total') + extractSum(maintenance, 'total'),
    breakdown: {
      fuel: extractSum(fuel, 'total'),
      service: extractSum(service, 'total'),
      maintenance: extractSum(maintenance, 'total'),
    },
  };
}

// Summarizes documents for the dashboard view, including status (valid, expiring soon, expired)
function summarizeDocuments(docs: IDocument[]) {
  return docs.map((doc) => ({
    _id: doc._id,
    type: doc.type,
    title: doc.title,
    expiryDate: doc.expiryDate,
    status: getDocumentStatus(doc),
  }));
}

// Main function to get the dashboard data for a bike, including bike info, service due info, expense summary, and documents
export const getBikeDashboard = async (userId: string, bikeId: string) => {
  const bike = await getBikeById(userId, bikeId);

  const [serviceDue, expenses, documents] = await Promise.all([
    getServiceDueInfo(bike),
    getExpenseSummary(bikeId),
    Document.find({ bikeId }),
  ]);

  return { bike, serviceDue, expenses, documents: summarizeDocuments(documents) };
};