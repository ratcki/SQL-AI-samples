import sql from "mssql";
import { Tool } from "@modelcontextprotocol/sdk/types.js";


export class DescribeTableTool implements Tool {
  [key: string]: any;
  name = "describe_table";
  description = "Describes the schema (columns and types) of a specified MSSQL Database table.";
  inputSchema = {
    type: "object",
    properties: {
      tableName: { type: "string", description: "Name of the table to describe" },
    },
    required: ["tableName"],
  } as any;

  async run(params: { tableName: string }) {
    try {
      let { tableName } = params;
      let schemaName: string | null = null;

      // Handle schema-prefixed table names (e.g., "dbo.TableName")
      if (tableName.includes('.')) {
        const parts = tableName.split('.');
        schemaName = parts[0];
        tableName = parts[1];
      }

      const request = new sql.Request();
      let query = `SELECT COLUMN_NAME as name, DATA_TYPE as type, CHARACTER_MAXIMUM_LENGTH as max_length, IS_NULLABLE as nullable FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @tableName`;
      request.input("tableName", sql.NVarChar, tableName);

      if (schemaName) {
        query += ` AND TABLE_SCHEMA = @schemaName`;
        request.input("schemaName", sql.NVarChar, schemaName);
      }

      query += ` ORDER BY ORDINAL_POSITION`;

      const result = await request.query(query);
      return {
        success: true,
        columns: result.recordset,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to describe table: ${error}`,
      };
    }
  }
}
