import { citySchema, createCitySchema, updateCitySchema } from '@repo/shared';
import { createZodDto } from 'nestjs-zod';

export class CityDto extends createZodDto(citySchema) {}
export class CreateCityDto extends createZodDto(createCitySchema) {}
export class UpdateCityDto extends createZodDto(updateCitySchema) {}
