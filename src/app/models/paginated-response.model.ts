// src/app/models/api-response.model.ts
export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Uso en tu servicio
export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;