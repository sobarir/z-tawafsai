import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { MctRule } from '@repo/shared';
import {
  CreateMctRuleDto,
  MctRuleDto,
  ResolveMctRuleDto,
  UpdateMctRuleDto,
} from './mct-rules.dto';
import { MctRulesService } from './mct-rules.service';

@ApiTags('mct-rules')
@Controller('mct-rules')
export class MctRulesController {
  constructor(private readonly mctRules: MctRulesService) {}

  @Get()
  @ApiOperation({ operationId: 'listMctRules', summary: 'List MCT rules' })
  @ApiOkResponse({ type: [MctRuleDto] })
  list(): Promise<MctRule[]> {
    return this.mctRules.list();
  }

  @Get('resolve')
  @ApiOperation({
    operationId: 'resolveMctRule',
    summary: 'Resolve the most-specific matching MCT rule',
  })
  @ApiOkResponse({ type: MctRuleDto })
  resolve(
    // Validated by the global ZodValidationPipe against resolveMctRuleQuerySchema
    @Query() query: ResolveMctRuleDto,
  ): Promise<MctRule> {
    return this.mctRules.resolve(query);
  }

  @Get(':id')
  @ApiOperation({ operationId: 'getMctRule', summary: 'Get an MCT rule' })
  @ApiOkResponse({ type: MctRuleDto })
  get(@Param('id') id: string): Promise<MctRule> {
    return this.mctRules.findById(id);
  }

  @Post()
  @ApiOperation({ operationId: 'createMctRule', summary: 'Create an MCT rule' })
  @ApiCreatedResponse({ type: MctRuleDto })
  create(
    // Validated by the global ZodValidationPipe against createMctRuleSchema
    @Body() body: CreateMctRuleDto,
  ): Promise<MctRule> {
    return this.mctRules.create(body);
  }

  @Patch(':id')
  @ApiOperation({ operationId: 'updateMctRule', summary: 'Update an MCT rule' })
  @ApiOkResponse({ type: MctRuleDto })
  update(
    @Param('id') id: string,
    @Body() body: UpdateMctRuleDto,
  ): Promise<MctRule> {
    return this.mctRules.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteMctRule', summary: 'Delete an MCT rule' })
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.mctRules.remove(id);
  }
}
