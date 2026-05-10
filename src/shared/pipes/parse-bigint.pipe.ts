import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseBigIntPipe implements PipeTransform<string, bigint> {
  transform(value: string, metadata: ArgumentMetadata): bigint {
    try {
      const bigIntValue = BigInt(value);
      return bigIntValue;
    } catch (error) {
      throw new BadRequestException(`Error de validación, "${value}" no es un tipo de dato BigInt.`);
    }
  }
}
