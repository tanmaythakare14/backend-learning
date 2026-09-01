/** Output DTO — shape returned to the client */
export interface ExampleOutDto {
  id: string;
  name: string;
  col1: string;
  col2: string;
  col3: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

/** Create DTO — fields required to create a new resource */
export interface ExampleCreateDto {
  name: string;
  col1: string;
  col2: string;
  col3: string;
}

/** Update DTO — all fields optional for partial update */
export interface ExampleUpdateDto {
  name?: string;
  col1?: string;
  col2?: string;
  col3?: string;
  isActive?: boolean;
}
