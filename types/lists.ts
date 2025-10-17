/**
 * Types for the dynamic lists management system
 */

export interface ListType {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListItem {
  id: number;
  listTypeId: string;
  value: string;
  label: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateListItemData {
  listTypeId: string;
  value: string;
  label: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateListItemData {
  value?: string;
  label?: string;
  displayOrder?: number;
  isActive?: boolean;
}

