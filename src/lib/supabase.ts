import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] as string;
const supabaseAnonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          bio: string | null;
          availability: "casual" | "part-time" | "full-time" | null;
          github_url: string | null;
          linkedin_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      skills: {
        Row: {
          id: string;
          profile_id: string;
          skill_name: string;
          category: "known" | "wants_to_learn";
        };
        Insert: Omit<Database["public"]["Tables"]["skills"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["skills"]["Insert"]>;
      };
      projects: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string | null;
          needed_roles: string[] | null;
          team_size_target: number | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["projects"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
      };
      team_members: {
        Row: {
          id: string;
          project_id: string;
          candidate_id: string;
          role: string | null;
          added_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["team_members"]["Row"], "id" | "added_at">;
        Update: Partial<Database["public"]["Tables"]["team_members"]["Insert"]>;
      };
      user_login_logs: {
        Row: {
          id: string;
          user_id: string;
          user_agent: string | null;
          logged_in_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_login_logs"]["Row"], "id" | "logged_in_at">;
        Update: never;
      };
    };
  };
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
export type SupabaseClient = typeof supabase;

