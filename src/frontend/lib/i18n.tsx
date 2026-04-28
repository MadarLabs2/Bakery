import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "he" | "ar";

type Dict = Record<string, { en: string; he: string; ar: string }>;

export const dict: Dict = {
  brand: {
    en: "Al-nour Gluten-free Bakery",
    he: "מאפיית אלנור ללא גלוטן",
    ar: "مخبز النور بدون جلوتين",
  },
  tagline: {
    en: "Wholesome gluten-free baking, made with love.",
    he: "מאפים ללא גלוטן, אפויים באהבה.",
    ar: "مخبوزات خالية من الجلوتين، تُصنع بحب.",
  },
  home: { en: "Home", he: "בית", ar: "الرئيسية" },
  products: { en: "Products", he: "מוצרים", ar: "المنتجات" },
  categories: { en: "Categories", he: "קטגוריות", ar: "الفئات" },
  cart: { en: "Cart", he: "סל", ar: "السلة" },
  myOrders: { en: "My Orders", he: "ההזמנות שלי", ar: "طلباتي" },
  about: { en: "About", he: "אודות", ar: "من نحن" },
  contact: { en: "Contact", he: "צור קשר", ar: "تواصل" },
  login: { en: "Login", he: "התחבר", ar: "دخول" },
  register: { en: "Sign up", he: "הרשמה", ar: "تسجيل" },
  logout: { en: "Logout", he: "התנתק", ar: "خروج" },
  admin: { en: "Admin", he: "ניהול", ar: "الإدارة" },
  bestSellers: { en: "Best Sellers", he: "הנמכרים ביותר", ar: "الأكثر مبيعاً" },
  shopAll: { en: "Shop all", he: "צפה בהכול", ar: "تسوق الكل" },
  addToCart: { en: "Add to cart", he: "הוסף לסל", ar: "أضف للسلة" },
  viewCart: { en: "View cart", he: "צפה בסל", ar: "عرض السلة" },
  checkout: { en: "Checkout", he: "תשלום", ar: "إتمام الشراء" },
  subtotal: { en: "Subtotal", he: "סכום ביניים", ar: "المجموع الفرعي" },
  discount: { en: "Discount", he: "הנחה", ar: "الخصم" },
  delivery: { en: "Delivery", he: "משלוח", ar: "التوصيل" },
  pickup: { en: "Pickup", he: "איסוף", ar: "استلام" },
  total: { en: "Total", he: "סה״כ", ar: "الإجمالي" },
  empty: { en: "Your cart is empty", he: "הסל ריק", ar: "السلة فارغة" },
  remove: { en: "Remove", he: "הסר", ar: "إزالة" },
  applyCoupon: { en: "Apply coupon", he: "החל קופון", ar: "تطبيق القسيمة" },
  couponCode: { en: "Coupon code", he: "קוד קופון", ar: "رمز القسيمة" },
  paymentMethod: { en: "Payment method", he: "אמצעי תשלום", ar: "طريقة الدفع" },
  creditCard: { en: "Credit card", he: "כרטיס אשראי", ar: "بطاقة ائتمان" },
  cash: { en: "Cash", he: "מזומן", ar: "نقد" },
  receivingMethod: { en: "Receiving method", he: "אופן קבלה", ar: "طريقة الاستلام" },
  placeOrder: { en: "Place order", he: "בצע הזמנה", ar: "تأكيد الطلب" },
  fullName: { en: "Full name", he: "שם מלא", ar: "الاسم الكامل" },
  phone: { en: "Phone", he: "טלפון", ar: "الهاتف" },
  email: { en: "Email", he: "אימייל", ar: "البريد الإلكتروني" },
  password: { en: "Password", he: "סיסמה", ar: "كلمة المرور" },
  address: { en: "Delivery address", he: "כתובת למשלוח", ar: "عنوان التوصيل" },
  notes: { en: "Notes", he: "הערות", ar: "ملاحظات" },
  orderConfirmed: { en: "Order placed!", he: "ההזמנה התקבלה!", ar: "تم تأكيد الطلب!" },
  subscribeTitle: {
    en: "Get sweet offers in your inbox",
    he: "הצעות מתוקות במייל",
    ar: "احصل على عروض حلوة في بريدك",
  },
  subscribeDesc: {
    en: "Subscribe for new arrivals and exclusive discounts.",
    he: "הירשם להטבות ומבצעים בלעדיים.",
    ar: "اشترك للحصول على عروض حصرية ومنتجات جديدة.",
  },
  subscribe: { en: "Subscribe", he: "הירשם", ar: "اشترك" },
  about1: { en: "About our bakery", he: "על המאפייה שלנו", ar: "عن مخبزنا" },
  aboutBody: {
    en: "We bake everything 100% gluten-free in a dedicated kitchen — using only the finest natural ingredients. Whether you have celiac disease, a sensitivity, or simply prefer gluten-free, every bite is made with care.",
    he: "אנו אופים הכול 100% ללא גלוטן במטבח ייעודי — תוך שימוש בחומרי הגלם הטבעיים הטובים ביותר. בין אם יש לכם צליאק, רגישות או שאתם פשוט מעדיפים ללא גלוטן — כל ביס נעשה באהבה.",
    ar: "نحن نخبز كل شيء خالٍ تمامًا من الجلوتين في مطبخ مخصص — باستخدام أجود المكونات الطبيعية. سواء كنت تعاني من حساسية القمح أو تفضل المخبوزات الخالية من الجلوتين، كل قضمة مصنوعة بعناية.",
  },
  searchProducts: { en: "Search products...", he: "חיפוש מוצרים...", ar: "ابحث عن المنتجات..." },
  noProducts: { en: "No products found.", he: "לא נמצאו מוצרים.", ar: "لا توجد منتجات." },
  noCategories: {
    en: "Categories will appear here soon.",
    he: "הקטגוריות יופיעו כאן בקרוב.",
    ar: "ستظهر الفئات هنا قريبًا.",
  },
  thanks: { en: "Thank you!", he: "תודה!", ar: "شكراً لك!" },
  alreadySub: { en: "Already subscribed", he: "כבר רשום", ar: "مشترك بالفعل" },
};

export const isRTL = (lang: Lang) => lang === "he" || lang === "ar";

interface I18nContext {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof dict) => string;
  dir: "ltr" | "rtl";
}

const I18nCtx = createContext<I18nContext | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    if (saved && ["en", "he", "ar"].includes(saved)) setLangState(saved);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = isRTL(lang) ? "rtl" : "ltr";
    }
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };

  const t = (key: keyof typeof dict) => dict[key]?.[lang] ?? key;

  return (
    <I18nCtx.Provider value={{ lang, setLang, t, dir: isRTL(lang) ? "rtl" : "ltr" }}>
      {children}
    </I18nCtx.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

export function pickName(p: { name_en: string; name_he: string; name_ar: string }, lang: Lang) {
  return lang === "he" ? p.name_he : lang === "ar" ? p.name_ar : p.name_en;
}
export function pickDesc(
  p: {
    description_en?: string | null;
    description_he?: string | null;
    description_ar?: string | null;
  },
  lang: Lang,
) {
  return (
    (lang === "he" ? p.description_he : lang === "ar" ? p.description_ar : p.description_en) ?? ""
  );
}
