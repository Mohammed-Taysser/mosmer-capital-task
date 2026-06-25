import { plainToInstance, Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsInt()
  @Min(0)
  @Max(65535)
  ORDERS_PORT!: number;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @Transform(({ value }: { value: unknown }): string[] => {
    if (typeof value === 'string') {
      return value.split(',').map((broker) => broker.trim());
    }
    // Fallback to an empty array if the input is missing or malformed
    return Array.isArray(value) ? value : [];
  })
  KAFKA_BROKERS!: string[];

  @IsString()
  @IsNotEmpty()
  KAFKA_ORDERS_CLIENT_ID!: string;

  @IsString()
  @IsNotEmpty()
  KAFKA_INVENTORY_CLIENT_ID!: string;

  @IsString()
  @IsNotEmpty()
  KAFKA_ORDERS_GROUP_ID!: string;

  @IsString()
  @IsNotEmpty()
  KAFKA_INVENTORY_GROUP_ID!: string;
}

function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const report = errors
      .map((error) => {
        const constraints = Object.values(error.constraints ?? {}).join(', ');
        return `  - ${error.property}: ${constraints}`;
      })
      .join('\n');

    throw new Error(`Invalid environment variables:\n${report}`);
  }

  return validatedConfig;
}

export { Environment, EnvironmentVariables, validate };
