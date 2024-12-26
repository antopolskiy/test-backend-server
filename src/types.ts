export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  phone?: string;
  address?: Address | null;
  company: string;
  jobTitle: string;
  avatar: string;
}
