export type FeishuField = {
  field_id: string;
  field_name: string;
  type: number;
  property?: unknown;
};

export type FeishuRecord = {
  record_id: string;
  fields: Record<string, unknown>;
  created_time?: number;
  last_modified_time?: number;
};

export type FeishuListResponse<T> = {
  code: number;
  msg: string;
  data?: {
    has_more?: boolean;
    page_token?: string;
    items?: T[];
    total?: number;
  };
};
