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
  heroGlutenFreeBadge: {
    en: "100% Gluten-Free",
    he: "100% ללא גלוטן",
    ar: "100٪ خالٍ من الجلوتين",
  },
  language: { en: "Language", he: "שפה", ar: "اللغة" },
  menu: { en: "Menu", he: "תפריט", ar: "القائمة" },
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
  readMore: { en: "Read more", he: "קרא עוד", ar: "اقرأ المزيد" },
  aboutProduct: { en: "About this product", he: "על המוצר", ar: "عن هذا المنتج" },
  ingredients: { en: "Ingredients", he: "מרכיבים", ar: "المكونات" },
  allergens: { en: "Allergens", he: "אלרגנים", ar: "مسببات الحساسية" },
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
  productsAllCategoriesFilter: {
    en: "All",
    he: "הכל",
    ar: "الكل",
  },
  catalogBackToTop: {
    en: "Back to top",
    he: "חזרה למעלה",
    ar: "العودة للأعلى",
  },
  noProducts: { en: "No products found.", he: "לא נמצאו מוצרים.", ar: "لا توجد منتجات." },
  adminNoMatchingProducts: {
    en: "No products match your search.",
    he: "אין מוצרים התואמים לחיפוש.",
    ar: "لا توجد منتجات تطابق بحثك.",
  },
  adminNoProductsInCategory: {
    en: "No products in this category.",
    he: "אין מוצרים בקטגוריה זו.",
    ar: "لا توجد منتجات في هذه الفئة.",
  },
  adminNoMatchingFilters: {
    en: "No products match your search and category filter.",
    he: "אין מוצרים התואמים לחיפוש ולסינון הקטגוריה.",
    ar: "لا توجد منتجات تطابق البحث وفلتر الفئة.",
  },
  adminFilterByCategory: {
    en: "Filter by category",
    he: "סינון לפי קטגוריה",
    ar: "تصفية حسب الفئة",
  },
  adminAllCategories: {
    en: "All categories",
    he: "כל הקטגוריות",
    ar: "جميع الفئات",
  },
  adminBackToTop: {
    en: "Back to top",
    he: "חזרה למעלה",
    ar: "العودة للأعلى",
  },
  close: { en: "Close", he: "סגור", ar: "إغلاق" },
  productNotFound: {
    en: "This product could not be found.",
    he: "המוצר לא נמצא.",
    ar: "تعذر العثور على هذا المنتج.",
  },
  unavailableProduct: {
    en: "This product is currently unavailable.",
    he: "המוצר אינו זמין כרגע.",
    ar: "هذا المنتج غير متوفر حاليًا.",
  },
  youMayAlsoLike: {
    en: "You may also like",
    he: "אולי תאהב גם",
    ar: "قد يعجبك أيضًا",
  },
  noCategories: {
    en: "Categories will appear here soon.",
    he: "הקטגוריות יופיעו כאן בקרוב.",
    ar: "ستظهر الفئات هنا قريبًا.",
  },
  thanks: { en: "Thank you!", he: "תודה!", ar: "شكراً لك!" },
  alreadySub: { en: "Already subscribed", he: "כבר רשום", ar: "مشترك بالفعل" },
  itemAddedToCartSuffix: {
    en: "Added to your cart",
    he: "נוסף לסל שלך",
    ar: "أُضيف إلى سلتك",
  },
  welcomeBack: { en: "Welcome back!", he: "ברוך שובך!", ar: "مرحبًا بعودتك!" },
  accountCreatedSuccess: {
    en: "Account created — you can sign in!",
    he: "החשבון נוצר — אפשר להתחבר!",
    ar: "تم إنشاء الحساب — يمكنك تسجيل الدخول!",
  },
  genericError: {
    en: "Something went wrong",
    he: "משהו השתבש",
    ar: "حدث خطأ ما",
  },
  invalidCoupon: { en: "Invalid coupon", he: "קופון לא תקין", ar: "قسيمة غير صالحة" },
  couponExpired: {
    en: "This coupon has expired",
    he: "תוקף הקופון פג",
    ar: "انتهت صلاحية هذه القسيمة",
  },
  couponExhausted: {
    en: "This coupon is no longer available",
    he: "הקופון אינו זמין יותר",
    ar: "هذه القسيمة لم تعد متاحة",
  },
  couponMinOrderLabel: {
    en: "Minimum order for this coupon",
    he: "סכום מינימלי להזמנה עם קופון זה",
    ar: "الحد الأدنى للطلب مع هذه القسيمة",
  },
  discountAppliedShort: {
    en: "Discount applied",
    he: "ההנחה הוחלה",
    ar: "تم تطبيق الخصم",
  },
  cartResetFailed: {
    en: "Could not reset the cart after your order",
    he: "לא ניתן לאפס את הסל אחרי ההזמנה",
    ar: "تعذر إعادة ضبط السلة بعد الطلب",
  },
  catalogConnectionError: {
    en: "Could not reach the bakery catalog. Check your connection and settings.",
    he: "לא ניתן לטעון את הקטלוג. בדקו את החיבור וההגדרות.",
    ar: "تعذر الوصول إلى الكتالوج. تحقق من الاتصال والإعدادات.",
  },
  catalogConfigHint: {
    en: "Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment and redeploy.",
    he: "הגדירו VITE_SUPABASE_URL ו-VITE_SUPABASE_ANON_KEY בסביבת ההרצה ופרסמו מחדש.",
    ar: "اضبط VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في بيئة التشغيل وأعد النشر.",
  },
  saved: { en: "Saved", he: "נשמר", ar: "تم الحفظ" },
  deleted: { en: "Deleted", he: "נמחק", ar: "تم الحذف" },
  updated: { en: "Updated", he: "עודכן", ar: "تم التحديث" },
  created: { en: "Created", he: "נוצר", ar: "تم الإنشاء" },
  imageUploaded: { en: "Image uploaded", he: "התמונה הועלתה", ar: "تم رفع الصورة" },
  subjectBodyRequired: {
    en: "Subject and message are required",
    he: "נדרשים נושא והודעה",
    ar: "الموضوع والرسالة مطلوبان",
  },
  mustSignIn: { en: "You must be signed in", he: "יש להתחבר", ar: "يجب تسجيل الدخول" },
  emailCampaignSavedTitle: {
    en: "Campaign saved — connect an email provider to send.",
    he: "הקמפיין נשמר — חברו ספק מייל כדי לשלוח.",
    ar: "تم حفظ الحملة — صِل مزود بريد لإرسالها.",
  },
  activeSubscribersShort: {
    en: "active subscribers",
    he: "מנויים פעילים",
    ar: "مشتركين نشطين",
  },
  adminPanelTitle: {
    en: "Management dashboard",
    he: "לוח ניהול",
    ar: "لوحة الإدارة",
  },
  adminRecentOrders: {
    en: "Recent orders",
    he: "הזמנות אחרונות",
    ar: "أحدث الطلبات",
  },
  adminNoOrdersYet: {
    en: "No orders yet.",
    he: "אין הזמנות עדיין.",
    ar: "لا توجد طلبات بعد.",
  },
  adminDashReportsTitle: {
    en: "Reports",
    he: "דוחות",
    ar: "التقارير",
  },
  adminDashReportsDesc: {
    en: "Metrics and sales trends",
    he: "מדדים ומגמות מכירה",
    ar: "مؤشرات واتجاهات المبيعات",
  },
  adminDashProductsDesc: {
    en: "Add, edit and manage inventory",
    he: "הוספה, עריכה וניהול מלאי",
    ar: "إضافة وتعديل وإدارة المخزون",
  },
  adminDashCategoriesDesc: {
    en: "Organize your catalog",
    he: "ארגון הקטלוג",
    ar: "تنظيم الكتالوج",
  },
  adminDashOrdersTitle: {
    en: "Orders",
    he: "הזמנות",
    ar: "الطلبات",
  },
  adminDashOrdersDesc: {
    en: "View and update order status",
    he: "צפייה ועדכון סטטוס הזמנה",
    ar: "عرض وتحديث حالة الطلب",
  },
  adminDashCouponsTitle: {
    en: "Coupons",
    he: "קופונים",
    ar: "القسائم",
  },
  adminDashCouponsDesc: {
    en: "Create discounts with validity rules",
    he: "יצירת הנחות עם תוקף",
    ar: "إنشاء خصومات بقواعد صلاحية",
  },
  adminDashEmailOffersTitle: {
    en: "Email offers",
    he: "הצעות במייל",
    ar: "عروض البريد",
  },
  adminDashEmailOffersDesc: {
    en: "Campaigns and subscriber list",
    he: "קמפיינים ורשימת מנויים",
    ar: "الحملات وقائمة المشتركين",
  },
  adminBackToPanel: {
    en: "Back to management panel",
    he: "חזרה ללוח הניהול",
    ar: "العودة إلى لوحة الإدارة",
  },
  adminNew: { en: "New", he: "חדש", ar: "جديد" },
  adminEdit: { en: "Edit", he: "עריכה", ar: "تعديل" },
  adminSave: { en: "Save", he: "שמור", ar: "حفظ" },
  adminCreate: { en: "Create", he: "צור", ar: "إنشاء" },
  adminBtnNewProduct: {
    en: "New product",
    he: "מוצר חדש",
    ar: "منتج جديد",
  },
  adminBtnNewCategory: {
    en: "New category",
    he: "קטגוריה חדשה",
    ar: "فئة جديدة",
  },
  adminBtnNewCoupon: {
    en: "New coupon",
    he: "קופון חדש",
    ar: "قسيمة جديدة",
  },
  adminDialogProductFormSr: {
    en: "Form to add or edit a catalog product: category, texts, price, image, and availability.",
    he: "טופס להוספה או עריכת מוצר בקטלוג: קטגוריה, תיאור, מחיר, תמונה וזמינות.",
    ar: "نموذج لإضافة منتج أو تعديله في الكتالوج: الفئة والنصوص والسعر والصورة والتوفر.",
  },
  adminDialogCategoryFormSr: {
    en: "Form to add or edit a category: names in English, Hebrew, Arabic, optional description and image.",
    he: "טופס להוספה או עריכת קטגוריה: שמות באנגלית, עברית וערבית, תיאור אופציונלי ותמונה.",
    ar: "نموذج لإضافة فئة أو تعديلها: أسماء بالإنجليزية والعبرية والعربية، وصف اختياري وصورة.",
  },
  adminDialogCouponFormSr: {
    en: "Form to create a discount coupon with code, type, limits, and expiry.",
    he: "טופס ליצירת קופון הנחה עם קוד, סוג, מגבלות ותוקף.",
    ar: "نموذج لإنشاء قسيمة خصم مع الرمز والنوع والحدود وتاريخ الانتهاء.",
  },
  adminDialogOrderDetailSr: {
    en: "Full order details, items, and totals.",
    he: "פרטי הזמנה מלאים, פריטים וסיכומים.",
    ar: "تفاصيل الطلب كاملة والبنود والمجاميع.",
  },
  adminDialogProductNewTitle: {
    en: "New product",
    he: "מוצר חדש",
    ar: "منتج جديد",
  },
  adminDialogProductEditTitle: {
    en: "Edit product",
    he: "עריכת מוצר",
    ar: "تعديل منتج",
  },
  adminDialogCategoryNewTitle: {
    en: "New category",
    he: "קטגוריה חדשה",
    ar: "فئة جديدة",
  },
  adminDialogCategoryEditTitle: {
    en: "Edit category",
    he: "עריכת קטגוריה",
    ar: "تعديل فئة",
  },
  adminDialogCouponNewTitle: {
    en: "New coupon",
    he: "קופון חדש",
    ar: "قسيمة جديدة",
  },
  adminLabelImage: { en: "Image", he: "תמונה", ar: "الصورة" },
  adminLabelCategory: {
    en: "Category",
    he: "קטגוריה",
    ar: "الفئة",
  },
  adminSelectCategoryPlaceholder: {
    en: "Select category",
    he: "בחר קטגוריה",
    ar: "اختر الفئة",
  },
  adminLabelPriceNis: {
    en: "Price (₪)",
    he: "מחיר (₪)",
    ar: "السعر (₪)",
  },
  adminLabelStockInternal: {
    en: "Stock (internal — not shown to customers)",
    he: "מלאי (פנימי — לא מוצג ללקוחות)",
    ar: "المخزون (داخلي — لا يظهر للعملاء)",
  },
  adminOptionalPlaceholder: {
    en: "optional",
    he: "אופציונלי",
    ar: "اختياري",
  },
  adminBestSellerLabel: {
    en: "Best seller",
    he: "רב מכר",
    ar: "الأكثر مبيعاً",
  },
  adminAvailableLabel: {
    en: "Available",
    he: "זמין",
    ar: "متاح",
  },
  adminStatusAvailable: {
    en: "Available",
    he: "זמין",
    ar: "متاح",
  },
  adminStatusHidden: {
    en: "Hidden",
    he: "מוסתר",
    ar: "مخفي",
  },
  adminThImage: { en: "Image", he: "תמונה", ar: "صورة" },
  adminThName: { en: "Name", he: "שם", ar: "الاسم" },
  adminThCategory: { en: "Category", he: "קטגוריה", ar: "الفئة" },
  adminThPrice: { en: "Price", he: "מחיר", ar: "السعر" },
  adminThStatus: { en: "Status", he: "סטטוס", ar: "الحالة" },
  adminThDescription: { en: "Description", he: "תיאור", ar: "الوصف" },
  adminThCode: { en: "Code", he: "קוד", ar: "الرمز" },
  adminThType: { en: "Type", he: "סוג", ar: "النوع" },
  adminThValue: { en: "Value", he: "ערך", ar: "القيمة" },
  adminThMin: { en: "Min", he: "מינ׳", ar: "الحد الأدنى" },
  adminThUses: { en: "Uses", he: "שימושים", ar: "الاستخدامات" },
  adminThDate: { en: "Date", he: "תאריך", ar: "التاريخ" },
  adminThCustomer: { en: "Customer", he: "לקוח", ar: "العميل" },
  adminThMethod: { en: "Method", he: "אמצעי", ar: "الطريقة" },
  adminThTotal: { en: "Total", he: "סה״כ", ar: "الإجمالي" },
  adminThOrderShort: { en: "#", he: "#", ar: "#" },
  adminNone: { en: "None", he: "ללא", ar: "لا يوجد" },
  adminCategoryImageHint: {
    en: "Choose a file (JPEG, PNG, WebP). It is stored in your Supabase bucket and the public link is saved on this category.",
    he: "בחרו קובץ (JPEG, PNG, WebP). הקובץ נשמר ב-Supabase והקישור הציבורי נשמר בקטגוריה.",
    ar: "اختر ملفًا (JPEG أو PNG أو WebP). يُخزَّن في مساحة Supabase ويُحفظ الرابط العام لهذه الفئة.",
  },
  adminUploading: { en: "Uploading…", he: "מעלה…", ar: "جارٍ الرفع…" },
  adminRemoveImage: { en: "Remove image", he: "הסר תמונה", ar: "إزالة الصورة" },
  adminDeleteConfirmProduct: {
    en: "Delete this product?",
    he: "למחוק מוצר זה?",
    ar: "حذف هذا المنتج؟",
  },
  adminDeleteProductTitle: {
    en: "Delete product?",
    he: "למחוק את המוצר?",
    ar: "حذف المنتج؟",
  },
  adminDeleteProductBody: {
    en: "This cannot be undone. The product will be removed from the catalog.",
    he: "פעולה זו לא ניתנת לביטול. המוצר יוסר מהקטלוג.",
    ar: "لا يمكن التراجع. سيتم إزالة المنتج من الكتالوج.",
  },
  adminDeleteAction: {
    en: "Delete",
    he: "מחק",
    ar: "حذف",
  },
  adminEditAction: {
    en: "Edit",
    he: "עריכה",
    ar: "تعديل",
  },
  cancel: {
    en: "Cancel",
    he: "ביטול",
    ar: "إلغاء",
  },
  adminProductIdLabel: {
    en: "ID",
    he: "מזהה",
    ar: "المعرّف",
  },
  adminStockShort: {
    en: "Stock",
    he: "מלאי",
    ar: "المخزون",
  },
  adminExpandImageHint: {
    en: "View image",
    he: "הצג תמונה",
    ar: "عرض الصورة",
  },
  adminCategoryLangEn: {
    en: "English",
    he: "אנגלית",
    ar: "الإنجليزية",
  },
  adminCategoryLangHe: {
    en: "Hebrew",
    he: "עברית",
    ar: "العبرية",
  },
  adminCategoryLangAr: {
    en: "Arabic",
    he: "ערבית",
    ar: "العربية",
  },
  adminCategoryNamesRequired: {
    en: "Enter at least one language name.",
    he: "נא למלא לפחות שם בשפה אחת.",
    ar: "أدخل الاسم بلغة واحدة على الأقل.",
  },
  adminSearchCategories: {
    en: "Search categories...",
    he: "חיפוש קטגוריות...",
    ar: "ابحث في الفئات...",
  },
  adminNoMatchingCategoriesSearch: {
    en: "No categories match your search.",
    he: "אין קטגוריות התואמות לחיפוש.",
    ar: "لا توجد فئات تطابق بحثك.",
  },
  adminCategoryImageUrlPlaceholder: {
    en: "https://… image URL",
    he: "https://… קישור לתמונה",
    ar: "https://… رابط الصورة",
  },
  adminDeleteCategoryTitle: {
    en: "Delete category?",
    he: "למחוק את הקטגוריה?",
    ar: "حذف الفئة؟",
  },
  adminDeleteCategoryBody: {
    en: "This cannot be undone. Products linked to this category keep their links — you may reassign them first.",
    he: "לא ניתן לבטל. מוצרים שמשויכים לקטגוריה זו נשמרים עם אות אזכור — מומלץ לעדכן אותם מראש במידת הצורך.",
    ar: "لا يمكن التراجع. تبقى المنتجات مرتبطة بهذه الفئة — يمكنك إعادة تعيينها مسبقًا.",
  },
  adminDeleteConfirmCategory: {
    en: "Delete this category?",
    he: "למחוק קטגוריה זו?",
    ar: "حذف هذه الفئة؟",
  },
  adminDeleteConfirmCoupon: {
    en: "Delete this coupon?",
    he: "למחוק קופון זה?",
    ar: "حذف هذه القسيمة؟",
  },
  adminDiscountTypePercentage: {
    en: "Percentage",
    he: "אחוזים",
    ar: "نسبة مئوية",
  },
  adminDiscountTypeFixed: {
    en: "Fixed (₪)",
    he: "סכום קבוע (₪)",
    ar: "مبلغ ثابت (₪)",
  },
  adminActive: { en: "Active", he: "פעיל", ar: "نشط" },
  adminInactive: { en: "Off", he: "כבוי", ar: "معطّل" },
  adminLabelCode: { en: "Code", he: "קוד", ar: "الرمز" },
  adminLabelType: { en: "Type", he: "סוג", ar: "النوع" },
  adminLabelValue: { en: "Value", he: "ערך", ar: "القيمة" },
  adminLabelMinOrder: {
    en: "Min order",
    he: "הזמנה מינימלית",
    ar: "الحد الأدنى للطلب",
  },
  adminLabelMaxUses: { en: "Max uses", he: "מקס׳ שימושים", ar: "الحد الأقصى للاستخدام" },
  adminLabelExpiresAt: {
    en: "Expires at",
    he: "תוקף עד",
    ar: "تنتهي في",
  },
  adminOrderTitlePrefix: {
    en: "Order",
    he: "הזמנה",
    ar: "طلب",
  },
  adminOrderSubtotal: { en: "Subtotal", he: "סכום ביניים", ar: "المجموع الفرعي" },
  adminOrderDeliveryLine: { en: "Delivery", he: "משלוח", ar: "التوصيل" },
  adminOrderDiscountLine: { en: "Discount", he: "הנחה", ar: "الخصم" },
  adminOrderTotalLine: { en: "Total", he: "סה״כ", ar: "الإجمالي" },
  adminOrderStatus_pending: { en: "Pending", he: "ממתין", ar: "معلّق" },
  adminOrderStatus_confirmed: { en: "Confirmed", he: "אושר", ar: "مؤكد" },
  adminOrderStatus_preparing: { en: "Preparing", he: "בהכנה", ar: "قيد التحضير" },
  adminOrderStatus_ready: { en: "Ready", he: "מוכן", ar: "جاهز" },
  adminOrderStatus_out_for_delivery: {
    en: "Out for delivery",
    he: "במשלוח",
    ar: "خارج للتوصيل",
  },
  adminOrderStatus_completed: { en: "Completed", he: "הושלם", ar: "مكتمل" },
  adminOrderStatus_cancelled: { en: "Cancelled", he: "בוטל", ar: "ملغى" },
  adminLabelSubject: { en: "Subject", he: "נושא", ar: "الموضوع" },
  adminLabelCampaignMessage: {
    en: "Message",
    he: "הודעה",
    ar: "الرسالة",
  },
  adminOffersCompose: { en: "Compose", he: "כתיבה", ar: "إنشاء" },
  adminOffersSubscribers: { en: "Subscribers", he: "מנויים", ar: "المشتركون" },
  adminOffersPastCampaigns: {
    en: "Past campaigns",
    he: "קמפיינים קודמים",
    ar: "حملات سابقة",
  },
  adminOffersLogCampaign: {
    en: "Log campaign",
    he: "רישום קמפיין",
    ar: "تسجيل الحملة",
  },
  adminOffersNoSubscribers: {
    en: "No subscribers yet.",
    he: "אין מנויים עדיין.",
    ar: "لا يوجد مشتركون بعد.",
  },
  adminOffersNoCampaigns: {
    en: "No campaigns yet.",
    he: "אין קמפיינים עדיין.",
    ar: "لا توجد حملات بعد.",
  },
  adminOffersDiscountHint: {
    en: "Optional discount code (existing coupon code)",
    he: "קוד קופון אופציונלי (קופון קיים)",
    ar: "رمز خصم اختياري (قسيمة موجودة)",
  },
  adminOffersSubjectPlaceholder: {
    en: "🥖 New gluten-free arrivals!",
    he: "🥖 הגעות חדשות ללא גלוטן!",
    ar: "🥖 وصولات جديدة خالية من الجلوتين!",
  },
  adminOffersMessagePlaceholder: {
    en: "Hello! This week…",
    he: "שלום! השבוע…",
    ar: "مرحبًا! هذا الأسبوع…",
  },
  adminMetricRevenue: { en: "Revenue", he: "הכנסות", ar: "الإيرادات" },
  adminMetricBestSellers: {
    en: "Best sellers",
    he: "רב מכר",
    ar: "الأكثر مبيعاً",
  },
  adminMetricTotalProducts: {
    en: "Total products",
    he: "סה״כ מוצרים",
    ar: "إجمالي المنتجات",
  },
  adminMetricTotalOrders: {
    en: "Total orders",
    he: "סה״כ הזמנות",
    ar: "إجمالي الطلبات",
  },
  commandPaletteTitle: {
    en: "Command palette",
    he: "פקודות מהירות",
    ar: "لوحة الأوامر",
  },
  commandPaletteA11yDesc: {
    en: "Search and select a command from the list.",
    he: "חפשו ובחרו פקודה מהרשימה.",
    ar: "ابحث واختر أمرًا من القائمة.",
  },
  adminLoading: { en: "Loading…", he: "טוען…", ar: "جارٍ التحميل…" },
  adminRedirecting: {
    en: "Redirecting…",
    he: "מפנה…",
    ar: "جارٍ إعادة التوجيه…",
  },
  adminMetricsOverviewSr: {
    en: "Metrics overview",
    he: "סקירת מדדים",
    ar: "نظرة على المؤشرات",
  },
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

export function pickName(
  p: { name?: string | null; name_en?: string | null; name_he?: string | null; name_ar?: string | null },
  lang: Lang,
) {
  const en = (p.name_en ?? "").trim();
  const he = (p.name_he ?? "").trim();
  const ar = (p.name_ar ?? "").trim();
  const legacy = (p.name ?? "").trim();

  if (lang === "he" && he) return he;
  if (lang === "ar" && ar) return ar;
  if (lang === "en" && en) return en;

  return en || he || ar || legacy;
}
export function pickDesc(p: { description?: string | null }, _lang: Lang) {
  return p.description ?? "";
}
