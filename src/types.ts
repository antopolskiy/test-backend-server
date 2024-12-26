export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: Address;
  company: string;
  jobTitle: string;
  avatar: string;
}
