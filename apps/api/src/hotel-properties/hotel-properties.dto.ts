import {
  createPropertySchema,
  propertySchema,
  updatePropertySchema,
} from '@repo/shared';
import { createZodDto } from 'nestjs-zod';

export class PropertyDto extends createZodDto(propertySchema) {}
export class CreatePropertyDto extends createZodDto(createPropertySchema) {}
export class UpdatePropertyDto extends createZodDto(updatePropertySchema) {}
