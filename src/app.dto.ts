import { ApiProperty } from '@nestjs/swagger';

export class CreateDTO {
  @ApiProperty({
    type: String,
  })
  hostDest: string;
  @ApiProperty({
    type: String,
  })
  address: string;
  @ApiProperty({
    type: String,
  })
  event: string | null;
}
