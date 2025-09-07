import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

enum StatsMode {
  FULL = 'full',
  SIMPLE = 'simple',
}

export class GetUserStatsDto {
  @IsOptional()
  @IsBoolean()
  includeTopUser?: boolean;

  @IsOptional()
  @IsEnum(StatsMode)
  mode?: StatsMode;
}
