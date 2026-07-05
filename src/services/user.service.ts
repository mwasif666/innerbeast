import api from "./api";

export type CustomerRole = "user" | "admin" | "superAdmin";

export type Customer = {
  _id: string;
  name: string;
  email: string;
  role: CustomerRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CustomersResponse = {
  success: boolean;
  count: number;
  data: Customer[];
};

export type CustomerResponse = {
  success: boolean;
  message?: string;
  data: Customer;
};

export const getCustomers = async () => {
  return await api<CustomersResponse>("/users");
};

export const updateCustomerStatus = async (id: string, isActive: boolean) => {
  return await api<CustomerResponse>(`/users/${id}/status`, {
    method: "PATCH",
    body: { isActive },
  });
};

export const updateCustomerRole = async (
  id: string,
  role: CustomerRole,
) => {
  return await api<CustomerResponse>(`/users/${id}/role`, {
    method: "PATCH",
    body: { role },
  });
};

export const deleteCustomer = async (id: string) => {
  return await api<{ success: boolean; message?: string }>(`/users/${id}`, {
    method: "DELETE",
  });
};
