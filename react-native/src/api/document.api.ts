import { AxiosInstance } from 'axios';
import { Document, SaveDocumentInput } from '../types/document.types';
import { ApiResponse } from '../types/api.types';

export function createDocumentApi(api: AxiosInstance) {
  return {
    getAll: (bikeId: string) =>
      api.get<ApiResponse<Document[]>>(`/bikes/${bikeId}/documents`).then((res) => res.data.data),

    getOne: (bikeId: string, documentId: string) =>
      api.get<ApiResponse<Document>>(`/bikes/${bikeId}/documents/${documentId}`).then((res) => res.data.data),

    // same endpoint handles create and update — backend upserts by type (except OTHER)
    save: (bikeId: string, data: SaveDocumentInput) =>
      api.post<ApiResponse<Document>>(`/bikes/${bikeId}/documents`, data).then((res) => res.data.data),

    delete: (bikeId: string, documentId: string) =>
      api.delete(`/bikes/${bikeId}/documents/${documentId}`),
  };
}