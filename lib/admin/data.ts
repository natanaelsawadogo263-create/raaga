import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type AdminProductListItem = {
  id: string;
  shop_id: string;
  category_id: string;
  name: string;
  description: string;
  category: string;
  city: string;
  price_cfa: number;
  stock_quantity: number;
  low_stock_threshold: number;
  status: Database["public"]["Tables"]["products"]["Row"]["status"];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  shop_name: string | null;
  primary_image: string | null;
};

export async function fetchAdminProducts(
  supabase: SupabaseClient<Database>,
): Promise<{ products: AdminProductListItem[]; error: string | null }> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      shop_id,
      category_id,
      name,
      description,
      category,
      city,
      price_cfa,
      stock_quantity,
      low_stock_threshold,
      status,
      is_active,
      created_at,
      updated_at,
      shops ( name ),
      product_images ( image_url, is_primary, sort_order )
    `,
    )
    .order("updated_at", { ascending: false });

  if (error) {
    return { products: [], error: error.message };
  }

  const rows = (data ?? []) as unknown as Array<
    Omit<AdminProductListItem, "shop_name" | "primary_image"> & {
      shops: { name: string } | null;
      product_images: { image_url: string; is_primary: boolean; sort_order: number }[] | null;
    }
  >;

  const products: AdminProductListItem[] = rows.map((r) => {
    const imgs = r.product_images ?? [];
    const sorted = [...imgs].sort((a, b) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
      return a.sort_order - b.sort_order;
    });
    return {
      id: r.id,
      shop_id: r.shop_id,
      category_id: r.category_id,
      name: r.name,
      description: r.description,
      category: r.category,
      city: r.city,
      price_cfa: r.price_cfa,
      stock_quantity: r.stock_quantity,
      low_stock_threshold: r.low_stock_threshold,
      status: r.status,
      is_active: r.is_active,
      created_at: r.created_at,
      updated_at: r.updated_at,
      shop_name: r.shops?.name ?? null,
      primary_image: sorted[0]?.image_url ?? null,
    };
  });

  return { products, error: null };
}

export type AdminShopOption = { id: string; name: string; city: string };

export async function fetchAdminShopOptions(
  supabase: SupabaseClient<Database>,
): Promise<{ shops: AdminShopOption[]; error: string | null }> {
  const { data, error } = await supabase
    .from("shops")
    .select("id, name, city")
    .order("name", { ascending: true });

  if (error) {
    return { shops: [], error: error.message };
  }
  return { shops: (data ?? []) as AdminShopOption[], error: null };
}

export type AdminShopListRow = {
  id: string;
  name: string;
  city: string;
  district: string;
  sector: string;
  address: string;
  phone: string;
  description: string | null;
  manager_name: string | null;
  status: Database["public"]["Tables"]["shops"]["Row"]["status"];
  owner_user_id: string | null;
  created_at: string;
  updated_at: string;
};

export async function fetchAdminShopsList(
  supabase: SupabaseClient<Database>,
): Promise<{ shops: AdminShopListRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from("shops")
    .select(
      "id, name, city, district, sector, address, phone, description, manager_name, status, owner_user_id, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return { shops: [], error: error.message };
  }
  return { shops: (data ?? []) as AdminShopListRow[], error: null };
}

export async function fetchAdminShopById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<{ shop: AdminShopListRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from("shops")
    .select(
      "id, name, city, district, sector, address, phone, description, manager_name, status, owner_user_id, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { shop: null, error: error.message };
  }
  return { shop: (data ?? null) as AdminShopListRow | null, error: null };
}

export type AdminCategoryOption = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
};

export async function fetchAdminCategoryOptions(
  supabase: SupabaseClient<Database>,
): Promise<{ categories: AdminCategoryOption[]; error: string | null }> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, is_active")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return { categories: [], error: error.message };
  }
  return { categories: (data ?? []) as AdminCategoryOption[], error: null };
}

export type AdminCategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export async function fetchAdminCategoriesList(
  supabase: SupabaseClient<Database>,
): Promise<{ categories: AdminCategoryRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return { categories: [], error: error.message };
  }
  return { categories: (data ?? []) as AdminCategoryRow[], error: null };
}

export async function fetchAdminCategoryById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<{ category: AdminCategoryRow | null; error: string | null }> {
  const { data, error } = await supabase.from("categories").select("*").eq("id", id).maybeSingle();

  if (error) {
    return { category: null, error: error.message };
  }
  return { category: data as AdminCategoryRow | null, error: null };
}

export type AdminProductDetail = {
  product: Database["public"]["Tables"]["products"]["Row"];
  shop_name: string | null;
  images: Database["public"]["Tables"]["product_images"]["Row"][];
};

export async function fetchAdminProductDetail(
  supabase: SupabaseClient<Database>,
  productId: string,
): Promise<{ detail: AdminProductDetail | null; error: string | null }> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      shops ( name ),
      product_images ( id, product_id, image_url, is_primary, sort_order, created_at )
    `,
    )
    .eq("id", productId)
    .maybeSingle();

  if (error) {
    return { detail: null, error: error.message };
  }
  if (!data) {
    return { detail: null, error: null };
  }

  const row = data as unknown as Database["public"]["Tables"]["products"]["Row"] & {
    shops: { name: string } | null;
    product_images: Database["public"]["Tables"]["product_images"]["Row"][] | null;
  };

  const { shops, product_images, ...product } = row;

  return {
    detail: {
      product,
      shop_name: shops?.name ?? null,
      images: [...(product_images ?? [])].sort((a, b) => {
        if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
        return a.sort_order - b.sort_order;
      }),
    },
    error: null,
  };
}

export type AdminOrderListItem = {
  id: string;
  reference: string;
  order_status: Database["public"]["Tables"]["orders"]["Row"]["order_status"];
  payment_method: Database["public"]["Tables"]["orders"]["Row"]["payment_method"];
  total_cfa: number;
  created_at: string;
  customer_name: string;
  driver_name: string | null;
};

export async function fetchAdminOrders(
  supabase: SupabaseClient<Database>,
  limit = 500,
): Promise<{ orders: AdminOrderListItem[]; error: string | null }> {
  const { data: rows, error } = await supabase
    .from("orders")
    .select("id, reference, order_status, payment_method, total_cfa, created_at, customer_id, driver_id")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { orders: [], error: error.message };
  }

  const list = rows ?? [];
  const ids = new Set<string>();
  for (const o of list) {
    ids.add(o.customer_id);
    if (o.driver_id) ids.add(o.driver_id);
  }

  const idArr = [...ids];
  const profileMap = new Map<string, { first_name: string; last_name: string }>();

  if (idArr.length > 0) {
    const { data: profiles, error: pErr } = await supabase
      .from("user_profiles")
      .select("id, first_name, last_name")
      .in("id", idArr);

    if (pErr) {
      return { orders: [], error: pErr.message };
    }
    for (const p of profiles ?? []) {
      profileMap.set(p.id, { first_name: p.first_name, last_name: p.last_name });
    }
  }

  const orders: AdminOrderListItem[] = list.map((r) => {
    const c = profileMap.get(r.customer_id);
    const d = r.driver_id ? profileMap.get(r.driver_id) : null;
    return {
      id: r.id,
      reference: r.reference,
      order_status: r.order_status,
      payment_method: r.payment_method,
      total_cfa: r.total_cfa,
      created_at: r.created_at,
      customer_name: c ? `${c.first_name} ${c.last_name}`.trim() : "—",
      driver_name: d ? `${d.first_name} ${d.last_name}`.trim() : null,
    };
  });

  return { orders, error: null };
}

export type AdminOrderDetail = {
  order: Database["public"]["Tables"]["orders"]["Row"];
  customer: Pick<
    Database["public"]["Tables"]["user_profiles"]["Row"],
    "id" | "first_name" | "last_name" | "phone" | "city" | "district" | "sector"
  > | null;
  driver: Pick<
    Database["public"]["Tables"]["user_profiles"]["Row"],
    "id" | "first_name" | "last_name" | "phone"
  > | null;
  items: Array<
    Database["public"]["Tables"]["order_items"]["Row"] & {
      product_name: string | null;
      shop_name: string | null;
    }
  >;
};

export async function fetchAdminOrderDetail(
  supabase: SupabaseClient<Database>,
  orderId: string,
): Promise<{ detail: AdminOrderDetail | null; error: string | null }> {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) {
    return { detail: null, error: orderError.message };
  }
  if (!order) {
    return { detail: null, error: null };
  }

  const [{ data: customer }, { data: driver }, { data: itemsRaw }] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("id, first_name, last_name, phone, city, district, sector")
      .eq("id", order.customer_id)
      .maybeSingle(),
    order.driver_id
      ? supabase
          .from("user_profiles")
          .select("id, first_name, last_name, phone")
          .eq("id", order.driver_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("order_items").select("*").eq("order_id", orderId),
  ]);

  const baseItems = itemsRaw ?? [];
  const productIds = [...new Set(baseItems.map((i) => i.product_id))];
  const shopIds = [...new Set(baseItems.map((i) => i.shop_id))];
  const productNames = new Map<string, string>();
  const shopNames = new Map<string, string>();

  if (productIds.length > 0) {
    const { data: plist } = await supabase.from("products").select("id, name").in("id", productIds);
    for (const p of plist ?? []) {
      productNames.set(p.id, p.name);
    }
  }
  if (shopIds.length > 0) {
    const { data: slist } = await supabase.from("shops").select("id, name").in("id", shopIds);
    for (const s of slist ?? []) {
      shopNames.set(s.id, s.name);
    }
  }

  return {
    detail: {
      order,
      customer: customer ?? null,
      driver: driver ?? null,
      items: baseItems.map((it) => ({
        ...it,
        product_name: productNames.get(it.product_id) ?? null,
        shop_name: shopNames.get(it.shop_id) ?? null,
      })),
    },
    error: null,
  };
}

export type AdminDriverOption = {
  user_id: string;
  label: string;
  phone: string | null;
};

export async function fetchApprovedDrivers(
  supabase: SupabaseClient<Database>,
): Promise<{ drivers: AdminDriverOption[]; error: string | null }> {
  const { data: drows, error } = await supabase
    .from("driver_profiles")
    .select("user_id")
    .eq("review_status", "approved");

  if (error) {
    return { drivers: [], error: error.message };
  }

  const userIds = (drows ?? []).map((r) => r.user_id).filter(Boolean);
  if (userIds.length === 0) {
    return { drivers: [], error: null };
  }

  const { data: profiles, error: pErr } = await supabase
    .from("user_profiles")
    .select("id, first_name, last_name, phone")
    .in("id", userIds);

  if (pErr) {
    return { drivers: [], error: pErr.message };
  }

  const drivers: AdminDriverOption[] = (profiles ?? []).map((p) => ({
    user_id: p.id,
    label: `${p.first_name} ${p.last_name}`.trim(),
    phone: p.phone ?? null,
  }));

  drivers.sort((a, b) => a.label.localeCompare(b.label, "fr"));
  return { drivers, error: null };
}

export type AdminProductPickerItem = {
  id: string;
  name: string;
  price_cfa: number;
  shop_id: string;
  shop_name: string | null;
  stock_quantity: number;
};

export async function fetchAdminProductsForPicker(
  supabase: SupabaseClient<Database>,
): Promise<{ products: AdminProductPickerItem[]; error: string | null }> {
  const { data: prows, error } = await supabase
    .from("products")
    .select("id, name, price_cfa, shop_id, stock_quantity")
    .eq("is_active", true)
    .order("name", { ascending: true })
    .limit(2000);

  if (error) {
    return { products: [], error: error.message };
  }

  const list = prows ?? [];
  const shopIds = [...new Set(list.map((p) => p.shop_id))];
  const shopNames = new Map<string, string>();
  if (shopIds.length > 0) {
    const { data: shops } = await supabase.from("shops").select("id, name").in("id", shopIds);
    for (const s of shops ?? []) {
      shopNames.set(s.id, s.name);
    }
  }

  return {
    products: list.map((r) => ({
      id: r.id,
      name: r.name,
      price_cfa: r.price_cfa,
      shop_id: r.shop_id,
      shop_name: shopNames.get(r.shop_id) ?? null,
      stock_quantity: r.stock_quantity,
    })),
    error: null,
  };
}

export type AdminCustomerRow = Pick<
  Database["public"]["Tables"]["user_profiles"]["Row"],
  | "id"
  | "role"
  | "first_name"
  | "last_name"
  | "phone"
  | "city"
  | "district"
  | "sector"
  | "avatar_url"
  | "is_active"
  | "created_at"
  | "updated_at"
> & { email: string | null };

async function authEmailsByUserId(): Promise<Map<string, string> | null> {
  try {
    const { getSupabaseAdminClient } = await import("@/lib/supabase/admin");
    const admin = getSupabaseAdminClient();
    const map = new Map<string, string>();
    let page = 1;
    const perPage = 1000;
    for (;;) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) {
        return null;
      }
      const users = data.users ?? [];
      for (const u of users) {
        if (u.email) {
          map.set(u.id, u.email);
        }
      }
      if (users.length < perPage) {
        break;
      }
      page += 1;
      if (page > 20) {
        break;
      }
    }
    return map;
  } catch {
    return null;
  }
}

export async function fetchAdminCustomersList(
  supabase: SupabaseClient<Database>,
): Promise<{ customers: AdminCustomerRow[]; error: string | null }> {
  const { data: rows, error } = await supabase
    .from("user_profiles")
    .select("id, role, first_name, last_name, phone, city, district, sector, avatar_url, is_active, created_at, updated_at")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  if (error) {
    return { customers: [], error: error.message };
  }

  const profiles = (rows ?? []) as Omit<AdminCustomerRow, "email">[];
  const emailMap = await authEmailsByUserId();

  const customers: AdminCustomerRow[] = profiles.map((p) => ({
    ...p,
    email: emailMap?.get(p.id) ?? null,
  }));

  return { customers, error: null };
}

const UUID_CUSTOMER_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function sanitizeIlikeFragment(s: string): string {
  return s.replace(/\\/g, "").replace(/%/g, "").replace(/,/g, " ").trim().slice(0, 80);
}

/** Recherche serveur (profil + e-mail Auth si la clé service est dispo). Limite 120 lignes. */
export async function searchAdminCustomers(
  supabase: SupabaseClient<Database>,
  qRaw: string,
): Promise<{ customers: AdminCustomerRow[]; error: string | null }> {
  const q = qRaw.trim();
  if (!q) {
    return { customers: [], error: null };
  }

  type ProfileRow = Omit<AdminCustomerRow, "email">;
  let rows: ProfileRow[] = [];

  if (UUID_CUSTOMER_RE.test(q)) {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("id, role, first_name, last_name, phone, city, district, sector, avatar_url, is_active, created_at, updated_at")
      .eq("role", "customer")
      .eq("id", q)
      .maybeSingle();
    if (error) {
      return { customers: [], error: error.message };
    }
    if (data) {
      rows = [data as ProfileRow];
    }
  } else {
    const safe = sanitizeIlikeFragment(q);
    if (!safe) {
      return { customers: [], error: null };
    }
    const p = `%${safe.replace(/"/g, '\\"')}%`;
    const quoted = `"${p}"`;
    const { data, error } = await supabase
      .from("user_profiles")
      .select("id, role, first_name, last_name, phone, city, district, sector, avatar_url, is_active, created_at, updated_at")
      .eq("role", "customer")
      .or(
        `first_name.ilike.${quoted},last_name.ilike.${quoted},phone.ilike.${quoted},city.ilike.${quoted},district.ilike.${quoted},sector.ilike.${quoted}`,
      )
      .order("created_at", { ascending: false })
      .limit(120);

    if (error) {
      return { customers: [], error: error.message };
    }
    rows = (data ?? []) as ProfileRow[];
  }

  const emailMap = await authEmailsByUserId();
  let customers: AdminCustomerRow[] = rows.map((row) => ({
    ...row,
    email: emailMap?.get(row.id) ?? null,
  }));

  const qLower = q.toLowerCase();
  if (q.includes("@")) {
    const byEmail = (c: AdminCustomerRow) => (c.email ?? "").toLowerCase().includes(qLower);
    const textHits = customers.filter(byEmail);
    if (textHits.length > 0) {
      customers = textHits;
    } else {
      try {
        const { getSupabaseAdminClient } = await import("@/lib/supabase/admin");
        const admin = getSupabaseAdminClient();
        const ids: string[] = [];
        let page = 1;
        const perPage = 1000;
        for (;;) {
          const { data: pageData, error: luErr } = await admin.auth.admin.listUsers({ page, perPage });
          if (luErr) {
            break;
          }
          const users = pageData.users ?? [];
          for (const u of users) {
            if (u.email?.toLowerCase().includes(qLower)) {
              ids.push(u.id);
            }
          }
          if (users.length < perPage) {
            break;
          }
          page += 1;
          if (page > 20) {
            break;
          }
        }
        if (ids.length === 0) {
          customers = [];
        } else {
          const { data: profRows, error: pErr } = await supabase
            .from("user_profiles")
            .select("id, role, first_name, last_name, phone, city, district, sector, avatar_url, is_active, created_at, updated_at")
            .eq("role", "customer")
            .in("id", ids.slice(0, 120))
            .order("created_at", { ascending: false });
          if (pErr) {
            return { customers: [], error: pErr.message };
          }
          customers = ((profRows ?? []) as ProfileRow[]).map((row) => ({
            ...row,
            email: emailMap?.get(row.id) ?? null,
          }));
        }
      } catch {
        customers = [];
      }
    }
  }

  const seen = new Set<string>();
  customers = customers.filter((c) => {
    if (seen.has(c.id)) {
      return false;
    }
    seen.add(c.id);
    return true;
  });

  return { customers, error: null };
}

export async function fetchAdminCustomerById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<{ customer: AdminCustomerRow | null; error: string | null }> {
  const { data: row, error } = await supabase
    .from("user_profiles")
    .select("id, role, first_name, last_name, phone, city, district, sector, avatar_url, is_active, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { customer: null, error: error.message };
  }
  if (!row || row.role !== "customer") {
    return { customer: null, error: null };
  }

  let email: string | null = null;
  try {
    const { getSupabaseAdminClient } = await import("@/lib/supabase/admin");
    const admin = getSupabaseAdminClient();
    const { data: authData, error: authErr } = await admin.auth.admin.getUserById(id);
    if (!authErr && authData.user?.email) {
      email = authData.user.email;
    }
  } catch {
    email = null;
  }

  const base = row as Omit<AdminCustomerRow, "email">;
  return { customer: { ...base, email }, error: null };
}

export type AdminDriverListRow = {
  user_id: string;
  review_status: Database["public"]["Tables"]["driver_profiles"]["Row"]["review_status"];
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  district: string;
  sector: string;
  avatar_url: string | null;
  profile_is_active: boolean;
  email_verified: boolean;
  is_available: boolean;
  wallet_balance_cfa: number;
  wallet_pending_cfa: number;
  average_rating: number | null;
  created_at: string;
  updated_at: string;
  id_card_front_url: string | null;
  id_card_back_url: string | null;
  plate_photo_url: string | null;
  face_photo_url: string | null;
};

type DriverProfileRow = Database["public"]["Tables"]["driver_profiles"]["Row"];

function mapDriverListRow(
  d: Pick<
    DriverProfileRow,
    | "user_id"
    | "review_status"
    | "email_verified"
    | "is_available"
    | "wallet_balance_cfa"
    | "wallet_pending_cfa"
    | "average_rating"
    | "created_at"
    | "updated_at"
    | "id_card_front_url"
    | "id_card_back_url"
    | "plate_photo_url"
    | "face_photo_url"
  >,
  p: Pick<
    Database["public"]["Tables"]["user_profiles"]["Row"],
    "first_name" | "last_name" | "phone" | "city" | "district" | "sector" | "avatar_url" | "is_active"
  >,
): AdminDriverListRow {
  return {
    user_id: d.user_id,
    review_status: d.review_status,
    first_name: p.first_name,
    last_name: p.last_name,
    phone: p.phone,
    city: p.city,
    district: p.district,
    sector: p.sector,
    avatar_url: p.avatar_url,
    profile_is_active: p.is_active,
    email_verified: d.email_verified,
    is_available: d.is_available,
    wallet_balance_cfa: d.wallet_balance_cfa,
    wallet_pending_cfa: d.wallet_pending_cfa,
    average_rating: d.average_rating,
    created_at: d.created_at,
    updated_at: d.updated_at,
    id_card_front_url: d.id_card_front_url,
    id_card_back_url: d.id_card_back_url,
    plate_photo_url: d.plate_photo_url,
    face_photo_url: d.face_photo_url,
  };
}

export async function fetchAdminDriversList(
  supabase: SupabaseClient<Database>,
): Promise<{ drivers: AdminDriverListRow[]; error: string | null }> {
  const { data: drows, error: dErr } = await supabase
    .from("driver_profiles")
    .select(
      "user_id, review_status, email_verified, is_available, wallet_balance_cfa, wallet_pending_cfa, average_rating, created_at, updated_at, id_card_front_url, id_card_back_url, plate_photo_url, face_photo_url",
    )
    .order("created_at", { ascending: false });

  if (dErr) {
    return { drivers: [], error: dErr.message };
  }

  const list = drows ?? [];
  const ids = list.map((d) => d.user_id);
  if (ids.length === 0) {
    return { drivers: [], error: null };
  }

  const { data: profs, error: pErr } = await supabase
    .from("user_profiles")
    .select("id, first_name, last_name, phone, city, district, sector, avatar_url, role, is_active")
    .in("id", ids)
    .eq("role", "driver");

  if (pErr) {
    return { drivers: [], error: pErr.message };
  }

  const profMap = new Map((profs ?? []).map((p) => [p.id, p]));

  const drivers: AdminDriverListRow[] = list
    .filter((d) => profMap.has(d.user_id))
    .map((d) => mapDriverListRow(d, profMap.get(d.user_id)!));

  drivers.sort((a, b) => {
    const pri = (s: AdminDriverListRow["review_status"]) =>
      s === "pending" ? 0 : s === "approved" ? 1 : 2;
    const pa = pri(a.review_status);
    const pb = pri(b.review_status);
    if (pa !== pb) {
      return pa - pb;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return { drivers, error: null };
}

export async function fetchAdminDriverByUserId(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ driver: AdminDriverListRow | null; error: string | null }> {
  const { data: d, error: dErr } = await supabase
    .from("driver_profiles")
    .select(
      "user_id, review_status, email_verified, is_available, wallet_balance_cfa, wallet_pending_cfa, average_rating, created_at, updated_at, id_card_front_url, id_card_back_url, plate_photo_url, face_photo_url",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (dErr) {
    return { driver: null, error: dErr.message };
  }
  if (!d) {
    return { driver: null, error: null };
  }

  const { data: p, error: pErr } = await supabase
    .from("user_profiles")
    .select("first_name, last_name, phone, city, district, sector, avatar_url, is_active")
    .eq("id", userId)
    .eq("role", "driver")
    .maybeSingle();

  if (pErr) {
    return { driver: null, error: pErr.message };
  }
  if (!p) {
    return { driver: null, error: null };
  }

  return { driver: mapDriverListRow(d, p), error: null };
}
