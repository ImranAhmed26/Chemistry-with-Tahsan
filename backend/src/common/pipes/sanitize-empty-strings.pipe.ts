import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

// HTML forms have no way to distinguish "field left blank" from "field
// explicitly set to an empty string" — every untouched optional input just
// sends "". class-validator's @IsOptional() only treats null/undefined as
// "absent", so an empty string still hits @IsEmail()/@IsDateString()/@IsIn()
// and fails validation. Normalizing "" -> undefined here, once, for every
// request body, means DTOs can use @IsOptional() the way form data actually
// requires it without every field needing a bespoke transform.
function stripEmptyStrings(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripEmptyStrings);
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      result[key] = stripEmptyStrings(v);
    }
    return result;
  }
  return value === '' ? undefined : value;
}

@Injectable()
export class SanitizeEmptyStringsPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }
    return stripEmptyStrings(value);
  }
}
