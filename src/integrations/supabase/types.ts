export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      chat_conversaciones: {
        Row: {
          created_at: string
          id: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          titulo?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_mensajes: {
        Row: {
          conversacion_id: string
          created_at: string
          id: string
          message_id: string | null
          parts: Json
          role: string
        }
        Insert: {
          conversacion_id: string
          created_at?: string
          id?: string
          message_id?: string | null
          parts: Json
          role: string
        }
        Update: {
          conversacion_id?: string
          created_at?: string
          id?: string
          message_id?: string | null
          parts?: Json
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_mensajes_conversacion_id_fkey"
            columns: ["conversacion_id"]
            isOneToOne: false
            referencedRelation: "chat_conversaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      codigos_verificacion: {
        Row: {
          codigo: string
          created_at: string
          empresa_id: string
          expira_at: string
          id: string
          usado_at: string | null
        }
        Insert: {
          codigo: string
          created_at?: string
          empresa_id: string
          expira_at: string
          id?: string
          usado_at?: string | null
        }
        Update: {
          codigo?: string
          created_at?: string
          empresa_id?: string
          expira_at?: string
          id?: string
          usado_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "codigos_verificacion_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      constancias: {
        Row: {
          compradora_id: string
          emitida_at: string
          hash_sha256: string
          id: string
          lote_id: string
          numero: string
          operacion_id: string
          snapshot: Json
          vendedora_id: string
        }
        Insert: {
          compradora_id: string
          emitida_at?: string
          hash_sha256: string
          id?: string
          lote_id: string
          numero: string
          operacion_id: string
          snapshot: Json
          vendedora_id: string
        }
        Update: {
          compradora_id?: string
          emitida_at?: string
          hash_sha256?: string
          id?: string
          lote_id?: string
          numero?: string
          operacion_id?: string
          snapshot?: Json
          vendedora_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "constancias_compradora_id_fkey"
            columns: ["compradora_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "constancias_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "constancias_operacion_id_fkey"
            columns: ["operacion_id"]
            isOneToOne: true
            referencedRelation: "operaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "constancias_vendedora_id_fkey"
            columns: ["vendedora_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          correo: string | null
          created_at: string
          direccion: string | null
          distrito: string | null
          id: string
          nombre_empresa: string | null
          representante: string | null
          ruc: string | null
          telefono: string | null
          terminos_aceptados_at: string | null
          updated_at: string
        }
        Insert: {
          correo?: string | null
          created_at?: string
          direccion?: string | null
          distrito?: string | null
          id: string
          nombre_empresa?: string | null
          representante?: string | null
          ruc?: string | null
          telefono?: string | null
          terminos_aceptados_at?: string | null
          updated_at?: string
        }
        Update: {
          correo?: string | null
          created_at?: string
          direccion?: string | null
          distrito?: string | null
          id?: string
          nombre_empresa?: string | null
          representante?: string | null
          ruc?: string | null
          telefono?: string | null
          terminos_aceptados_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lote_fotos: {
        Row: {
          captura_en_vivo: boolean
          created_at: string
          id: string
          lote_id: string
          orden: number
          ruta_storage: string
        }
        Insert: {
          captura_en_vivo?: boolean
          created_at?: string
          id?: string
          lote_id: string
          orden?: number
          ruta_storage: string
        }
        Update: {
          captura_en_vivo?: boolean
          created_at?: string
          id?: string
          lote_id?: string
          orden?: number
          ruta_storage?: string
        }
        Relationships: [
          {
            foreignKeyName: "lote_fotos_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
        ]
      }
      lotes: {
        Row: {
          categoria: string
          codigo: string
          codigo_verificacion: string
          codigo_verificacion_expira_at: string
          created_at: string
          declaracion_aceptada_at: string
          descripcion: string
          distrito: string
          empaque: string
          empresa_id: string
          estado: Database["public"]["Enums"]["estado_lote"]
          id: string
          motivo_rechazo: string | null
          peso_kg: number
          publicado_at: string | null
          updated_at: string
        }
        Insert: {
          categoria: string
          codigo?: string
          codigo_verificacion: string
          codigo_verificacion_expira_at: string
          created_at?: string
          declaracion_aceptada_at: string
          descripcion: string
          distrito: string
          empaque: string
          empresa_id: string
          estado?: Database["public"]["Enums"]["estado_lote"]
          id?: string
          motivo_rechazo?: string | null
          peso_kg: number
          publicado_at?: string | null
          updated_at?: string
        }
        Update: {
          categoria?: string
          codigo?: string
          codigo_verificacion?: string
          codigo_verificacion_expira_at?: string
          created_at?: string
          declaracion_aceptada_at?: string
          descripcion?: string
          distrito?: string
          empaque?: string
          empresa_id?: string
          estado?: Database["public"]["Enums"]["estado_lote"]
          id?: string
          motivo_rechazo?: string | null
          peso_kg?: number
          publicado_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lotes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      operaciones: {
        Row: {
          aceptada_at: string | null
          agua_ahorrada_l: number
          cerrada_at: string | null
          co2e_evitado_kg: number
          completada_at: string | null
          created_at: string
          empresa_compradora_id: string
          empresa_vendedora_id: string
          entregada_at: string | null
          estado: Database["public"]["Enums"]["estado_operacion"]
          id: string
          kg_desviados: number
          lote_id: string | null
          mensaje: string | null
          problema_at: string | null
          problema_detalle: string | null
          recogida: string | null
          updated_at: string
        }
        Insert: {
          aceptada_at?: string | null
          agua_ahorrada_l?: number
          cerrada_at?: string | null
          co2e_evitado_kg?: number
          completada_at?: string | null
          created_at?: string
          empresa_compradora_id: string
          empresa_vendedora_id: string
          entregada_at?: string | null
          estado?: Database["public"]["Enums"]["estado_operacion"]
          id?: string
          kg_desviados?: number
          lote_id?: string | null
          mensaje?: string | null
          problema_at?: string | null
          problema_detalle?: string | null
          recogida?: string | null
          updated_at?: string
        }
        Update: {
          aceptada_at?: string | null
          agua_ahorrada_l?: number
          cerrada_at?: string | null
          co2e_evitado_kg?: number
          completada_at?: string | null
          created_at?: string
          empresa_compradora_id?: string
          empresa_vendedora_id?: string
          entregada_at?: string | null
          estado?: Database["public"]["Enums"]["estado_operacion"]
          id?: string
          kg_desviados?: number
          lote_id?: string | null
          mensaje?: string | null
          problema_at?: string | null
          problema_detalle?: string | null
          recogida?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operaciones_empresa_compradora_id_fkey"
            columns: ["empresa_compradora_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operaciones_empresa_vendedora_id_fkey"
            columns: ["empresa_vendedora_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operaciones_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
        ]
      }
      reportes_lote: {
        Row: {
          created_at: string
          detalle: string | null
          estado: Database["public"]["Enums"]["estado_reporte"]
          id: string
          lote_id: string
          motivo: string
          reportado_por_empresa_id: string
        }
        Insert: {
          created_at?: string
          detalle?: string | null
          estado?: Database["public"]["Enums"]["estado_reporte"]
          id?: string
          lote_id: string
          motivo: string
          reportado_por_empresa_id: string
        }
        Update: {
          created_at?: string
          detalle?: string | null
          estado?: Database["public"]["Enums"]["estado_reporte"]
          id?: string
          lote_id?: string
          motivo?: string
          reportado_por_empresa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reportes_lote_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_lote_reportado_por_empresa_id_fkey"
            columns: ["reportado_por_empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      crear_lote_validado: {
        Args: { p_datos: Json; p_empresa: string; p_max_activos: number }
        Returns: {
          categoria: string
          codigo: string
          codigo_verificacion: string
          codigo_verificacion_expira_at: string
          created_at: string
          declaracion_aceptada_at: string
          descripcion: string
          distrito: string
          empaque: string
          empresa_id: string
          estado: Database["public"]["Enums"]["estado_lote"]
          id: string
          motivo_rechazo: string | null
          peso_kg: number
          publicado_at: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "lotes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      foto_es_publica: { Args: { _ruta: string }; Returns: boolean }
      generar_codigo_lote: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hash_constancia: {
        Args: { p_emitida: string; p_snapshot: Json }
        Returns: string
      }
      impacto_publico: {
        Args: never
        Returns: {
          agua_ahorrada_l: number
          co2e_evitado_kg: number
          kg_desviados: number
          operaciones_completadas: number
        }[]
      }
      lote_publico: {
        Args: { p_codigo: string }
        Returns: {
          categoria: string
          codigo: string
          descripcion: string
          distrito: string
          empaque: string
          empresa_id: string
          estado: Database["public"]["Enums"]["estado_lote"]
          fotos: string[]
          id: string
          nombre_empresa: string
          peso_kg: number
          publicado_at: string
        }[]
      }
      mercado_lotes: {
        Args: never
        Returns: {
          categoria: string
          codigo: string
          distrito: string
          empresa_id: string
          foto_principal: string
          nombre_empresa: string
          peso_kg: number
          publicado_at: string
        }[]
      }
      reportar_lote_validado: {
        Args: {
          p_detalle: string
          p_empresa: string
          p_lote: string
          p_motivo: string
          p_umbral: number
        }
        Returns: undefined
      }
      solicitar_lote_validado: {
        Args: {
          p_empresa: string
          p_lote: string
          p_max_pendientes: number
          p_mensaje: string
          p_recogida: string
        }
        Returns: {
          aceptada_at: string | null
          agua_ahorrada_l: number
          cerrada_at: string | null
          co2e_evitado_kg: number
          completada_at: string | null
          created_at: string
          empresa_compradora_id: string
          empresa_vendedora_id: string
          entregada_at: string | null
          estado: Database["public"]["Enums"]["estado_operacion"]
          id: string
          kg_desviados: number
          lote_id: string | null
          mensaje: string | null
          problema_at: string | null
          problema_detalle: string | null
          recogida: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "operaciones"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      transicion_trato: {
        Args: {
          p_accion: string
          p_detalle: string
          p_empresa: string
          p_operacion: string
        }
        Returns: Json
      }
      verificar_constancia: {
        Args: { p_numero: string }
        Returns: {
          categoria: string
          compradora: string
          emitida_at: string
          hash_valido: boolean
          numero: string
          peso_kg: number
          vendedora: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      estado_lote:
        | "en_revision"
        | "publicado"
        | "retirado"
        | "reservado"
        | "entregado"
      estado_operacion:
        | "pendiente"
        | "completada"
        | "cancelada"
        | "solicitada"
        | "aceptada"
        | "entregada"
        | "rechazada"
        | "con_problema"
      estado_reporte: "abierto" | "revisado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      estado_lote: [
        "en_revision",
        "publicado",
        "retirado",
        "reservado",
        "entregado",
      ],
      estado_operacion: [
        "pendiente",
        "completada",
        "cancelada",
        "solicitada",
        "aceptada",
        "entregada",
        "rechazada",
        "con_problema",
      ],
      estado_reporte: ["abierto", "revisado"],
    },
  },
} as const
