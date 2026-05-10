export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          role: "customer" | "driver" | "admin" | "super_admin" | "shop_owner";
          first_name: string;
          last_name: string;
          phone: string;
          city: string;
          district: string;
          sector: string;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: "customer" | "driver" | "admin" | "super_admin" | "shop_owner";
          first_name: string;
          last_name: string;
          phone: string;
          city: string;
          district: string;
          sector: string;
          avatar_url?: string | null;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["user_profiles"]["Insert"]>;
        Relationships: [];
      };
      driver_profiles: {
        Row: {
          user_id: string;
          review_status: "pending" | "approved" | "rejected";
          email_verified: boolean;
          id_card_front_url: string | null;
          id_card_back_url: string | null;
          plate_photo_url: string | null;
          face_photo_url: string | null;
          is_available: boolean;
          wallet_balance_cfa: number;
          wallet_pending_cfa: number;
          average_rating: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          review_status?: "pending" | "approved" | "rejected";
          email_verified?: boolean;
          id_card_front_url?: string | null;
          id_card_back_url?: string | null;
          plate_photo_url?: string | null;
          face_photo_url?: string | null;
          is_available?: boolean;
          wallet_balance_cfa?: number;
          wallet_pending_cfa?: number;
          average_rating?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["driver_profiles"]["Insert"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          image_url: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string;
          image_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          shop_id: string;
          category_id: string;
          name: string;
          description: string;
          category: string;
          city: string;
          price_cfa: number;
          compare_at_price_cfa: number | null;
          variant_options: Json;
          stock_quantity: number;
          low_stock_threshold: number;
          status: "normal" | "promotion" | "nouveaute" | "best_seller" | "rupture";
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          category_id: string;
          name: string;
          description: string;
          category?: string;
          city: string;
          price_cfa: number;
          compare_at_price_cfa?: number | null;
          variant_options?: Json;
          stock_quantity?: number;
          low_stock_threshold?: number;
          status?: "normal" | "promotion" | "nouveaute" | "best_seller" | "rupture";
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          /** Public 9-digit order code (unique). */
          reference: string;
          customer_id: string;
          driver_id: string | null;
          order_status:
            | "validated"
            | "awaiting_driver"
            | "accepted_by_driver"
            | "picked_up"
            | "in_delivery"
            | "delivery_declared"
            | "secret_validated"
            | "confirmed_by_customer"
            | "delivered"
            | "problematic"
            | "cancelled";
          payment_method: "cod" | "orange_money" | "moov_money";
          delivery_fee_cfa: number;
          subtotal_cfa: number;
          discount_cfa: number;
          total_cfa: number;
          delivery_secret_code: string;
          delivery_secret_validated: boolean;
          estimated_delivery_min: number | null;
          estimated_delivery_max: number | null;
          city: string;
          district: string;
          sector: string;
          delivery_address: string;
          promo_code_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reference?: string;
          customer_id: string;
          driver_id?: string | null;
          order_status?:
            | "validated"
            | "awaiting_driver"
            | "accepted_by_driver"
            | "picked_up"
            | "in_delivery"
            | "delivery_declared"
            | "secret_validated"
            | "confirmed_by_customer"
            | "delivered"
            | "problematic"
            | "cancelled";
          payment_method: "cod" | "orange_money" | "moov_money";
          delivery_fee_cfa?: number;
          subtotal_cfa: number;
          discount_cfa?: number;
          total_cfa: number;
          delivery_secret_code: string;
          delivery_secret_validated?: boolean;
          estimated_delivery_min?: number | null;
          estimated_delivery_max?: number | null;
          city: string;
          district: string;
          sector: string;
          delivery_address: string;
          promo_code_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      carts: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          quantity?: number;
        };
        Update: Partial<Database["public"]["Tables"]["carts"]["Insert"]>;
        Relationships: [];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["favorites"]["Insert"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          shop_id: string;
          quantity: number;
          unit_price_cfa: number;
          total_price_cfa: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          shop_id: string;
          quantity: number;
          unit_price_cfa: number;
          total_price_cfa: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          is_primary: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          image_url: string;
          is_primary?: boolean;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>;
        Relationships: [];
      };
      shops: {
        Row: {
          id: string;
          name: string;
          city: string;
          district: string;
          sector: string;
          address: string;
          phone: string;
          description: string | null;
          manager_name: string | null;
          status: "active" | "inactive" | "suspended" | "pending";
          owner_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          city: string;
          district: string;
          sector: string;
          address: string;
          phone: string;
          description?: string | null;
          manager_name?: string | null;
          status?: "active" | "inactive" | "suspended" | "pending";
          owner_user_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["shops"]["Insert"]>;
        Relationships: [];
      };
      support_tickets: {
        Row: {
          id: string;
          user_id: string;
          order_id: string | null;
          subject: string;
          message: string;
          status: "open" | "in_progress" | "waiting_user" | "resolved" | "closed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_id?: string | null;
          subject: string;
          message: string;
          status?: "open" | "in_progress" | "waiting_user" | "resolved" | "closed";
        };
        Update: Partial<Database["public"]["Tables"]["support_tickets"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      admin_delete_user: {
        Args: { target_user_id: string };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
