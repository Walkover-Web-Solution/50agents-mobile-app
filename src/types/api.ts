export type Company = {
  id: number;
  name?: string;
  company_uname?: string;
  email?: string | null;
  mobile?: string | null;
  role_name?: string | null;
  timezone?: string;
  is_block?: boolean;
  created_by?: number;
  is_readable?: boolean;
  role_id?: number;
  feature_configuration_id?: number;
  meta?: any;
  created_at?: string;
  updated_at?: string;
};

export type PersonData = {
  id: number;
  name: string;
  mobile: string | null;
  email: string;
  client_id: number;
  meta: any;
  created_at: string;
  updated_at: string;
  is_block: boolean;
  feature_configuration_id: number;
  is_password_verified: number;
  c_companies: Company[];
  currentCompany: Company | null;
};

export type GetDetailsResponse = {
  data: PersonData[];
  status: string;
  hasError: boolean;
  errors: any[];
  proxy_duration: number;
};

export type LoginResponse = {
  token?: string;
  data?: {
    token?: string;
    access_token?: string;
    [key: string]: any;
  };
  [key: string]: any;
};
