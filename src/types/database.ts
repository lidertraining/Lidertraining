/**
 * Tipos gerados pelo Supabase CLI.
 *
 * Este arquivo é um stub. Para usar tipos reais do banco, rode:
 *   pnpm supabase:types
 *
 * Ele sobrescreve este arquivo com o shape das tabelas. Até lá, usamos um
 * shape permissivo que evita erros de TS em .insert/.update/.rpc.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

type Row = Record<string, any>;

interface PermissiveTable {
  Row: Row;
  Insert: Row;
  Update: Row;
  Relationships: [];
}

interface PermissiveFunction {
  Args: Row;
  Returns: any;
}

export interface Database {
  public: {
    Tables: Record<string, PermissiveTable>;
    Views: Record<string, { Row: Row }>;
    Functions: Record<string, PermissiveFunction>;
    Enums: Record<string, string>;
    CompositeTypes: Record<string, Row>;
  };
}
