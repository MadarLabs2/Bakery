export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cart_id: string;
          product_id: string;
          quantity: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cart_id?: string;
          product_id?: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "cart_items_cart_id_fkey"; columns: ["cart_id"]; referencedRelation: "carts"; referencedColumns: ["id"] },
          { foreignKeyName: "cart_items_product_id_fkey"; columns: ["product_id"]; referencedRelation: "products"; referencedColumns: ["id"] },
        ];
      };
      carts: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [{ foreignKeyName: "carts_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] }];
      };
      app_settings: {
        Row: {
          id: number;
          admin_email: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          admin_email: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          admin_email?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          name_en: string | null;
          name_he: string | null;
          name_ar: string | null;
          description: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_en?: string | null;
          name_he?: string | null;
          name_ar?: string | null;
          description?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          name_en?: string | null;
          name_he?: string | null;
          name_ar?: string | null;
          description?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          message: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          phone?: string | null;
          message: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          message?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          discount_type: string;
          discount_value: number;
          min_order_amount: number;
          max_uses: number | null;
          used_count: number;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          discount_type: string;
          discount_value: number;
          min_order_amount?: number;
          max_uses?: number | null;
          used_count?: number;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          discount_type?: string;
          discount_value?: number;
          min_order_amount?: number;
          max_uses?: number | null;
          used_count?: number;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      email_campaigns: {
        Row: {
          id: string;
          admin_id: string;
          subject: string;
          message: string;
          discount_code: string | null;
          sent_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          subject: string;
          message: string;
          discount_code?: string | null;
          sent_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          subject?: string;
          message?: string;
          discount_code?: string | null;
          sent_at?: string;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "email_campaigns_admin_id_fkey"; columns: ["admin_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      email_subscribers: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          product_price: number;
          quantity: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          product_price: number;
          quantity: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          product_price?: number;
          quantity?: number;
          total_price?: number;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "order_items_order_id_fkey"; columns: ["order_id"]; referencedRelation: "orders"; referencedColumns: ["id"] },
          { foreignKeyName: "order_items_product_id_fkey"; columns: ["product_id"]; referencedRelation: "products"; referencedColumns: ["id"] },
        ];
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          coupon_id: string | null;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          delivery_method: string;
          payment_method: string;
          payment_status: string;
          order_status: string;
          subtotal: number;
          discount_amount: number;
          delivery_fee: number;
          total_amount: number;
          delivery_address: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          coupon_id?: string | null;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          delivery_method: string;
          payment_method: string;
          payment_status?: string;
          order_status?: string;
          subtotal: number;
          discount_amount?: number;
          delivery_fee?: number;
          total_amount: number;
          delivery_address?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          coupon_id?: string | null;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string;
          delivery_method?: string;
          payment_method?: string;
          payment_status?: string;
          order_status?: string;
          subtotal?: number;
          discount_amount?: number;
          delivery_fee?: number;
          total_amount?: number;
          delivery_address?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "orders_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "orders_coupon_id_fkey"; columns: ["coupon_id"]; referencedRelation: "coupons"; referencedColumns: ["id"] },
        ];
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          ingredients: string | null;
          allergens: string | null;
          price: number;
          image_url: string | null;
          stock_quantity: number | null;
          is_best_seller: boolean;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          ingredients?: string | null;
          allergens?: string | null;
          price: number;
          image_url?: string | null;
          stock_quantity?: number | null;
          is_best_seller?: boolean;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
          description?: string | null;
          ingredients?: string | null;
          allergens?: string | null;
          price?: number;
          image_url?: string | null;
          stock_quantity?: number | null;
          is_best_seller?: boolean;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "products_category_id_fkey"; columns: ["category_id"]; referencedRelation: "categories"; referencedColumns: ["id"] },
        ];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
