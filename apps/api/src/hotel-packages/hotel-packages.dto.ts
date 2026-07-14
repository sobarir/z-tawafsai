import {
  createPackageSchema,
  packageSchema,
  updatePackageSchema,
} from '@repo/shared';
import { createZodDto } from 'nestjs-zod';

export class PackageDto extends createZodDto(packageSchema) {}
export class CreatePackageDto extends createZodDto(createPackageSchema) {}
export class UpdatePackageDto extends createZodDto(updatePackageSchema) {}
