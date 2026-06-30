import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { legalSharedDict } from "@/frontend/lib/legalShared.i18n";
import { cookieConsentDict } from "@/frontend/lib/cookieConsent.i18n";
import { privacyDict } from "@/frontend/lib/privacyPolicy.i18n";
import { termsDict } from "@/frontend/lib/termsPolicy.i18n";
import { accessibilityDict } from "@/frontend/lib/accessibilityPolicy.i18n";
import { fulfillmentDaysDict } from "@/frontend/lib/fulfillmentDays.i18n";
import { restDaysDict } from "@/frontend/lib/restDays.i18n";
import { deliveryPlacesDict } from "@/frontend/lib/deliveryPlaces.i18n";
import {
  allowsPreferencesStorage,
  PREFERENCES_REVOKED_EVENT,
} from "@/frontend/lib/cookieConsent";

export type Lang = "en" | "he" | "ar";

type Dict = Record<string, { en: string; he: string; ar: string }>;

export const dict: Dict = {
  ...legalSharedDict,
  ...cookieConsentDict,
  ...privacyDict,
  ...termsDict,
  ...accessibilityDict,
  ...fulfillmentDaysDict,
  ...restDaysDict,
  ...deliveryPlacesDict,
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
  skipToMain: {
    en: "Skip to main content",
    he: "דלג לתוכן הראשי",
    ar: "تخطّ إلى المحتوى الرئيسي",
  },
  splashSkip: { en: "Skip", he: "דלג", ar: "تخطّ" },
  accountMenu: { en: "Account menu", he: "תפריט חשבון", ar: "قائمة الحساب" },
  contactSendMessage: {
    en: "Send a message",
    he: "שליחת הודעה",
    ar: "إرسال رسالة",
  },
  contactMessageLabel: { en: "Message", he: "הודעה", ar: "الرسالة" },
  contactSending: { en: "Sending…", he: "שולח…", ar: "جارٍ الإرسال…" },
  contactSend: { en: "Send", he: "שלח", ar: "إرسال" },
  decreaseQuantity: {
    en: "Decrease quantity",
    he: "הפחת כמות",
    ar: "تقليل الكمية",
  },
  increaseQuantity: {
    en: "Increase quantity",
    he: "הוסף כמות",
    ar: "زيادة الكمية",
  },
  quantityLabel: { en: "Quantity", he: "כמות", ar: "الكمية" },
  heroCarouselLabel: {
    en: "Bakery showcase images",
    he: "תמונות תצוגה מהמאפייה",
    ar: "صور عرض من المخبز",
  },
  heroSlideAlt1: {
    en: "Fresh gluten-free baked goods display",
    he: "תצוגת מאפים טריים ללא גלוטן",
    ar: "عرض مخبوزات طازجة خالية من الغلوتين",
  },
  heroSlideAlt2: {
    en: "Assorted gluten-free breads and pastries",
    he: "מבחר לחמים ומאפים ללא גלוטן",
    ar: "تشكيلة أرغفة ومعجنات خالية من الغلوتين",
  },
  heroPreviousSlide: {
    en: "Previous image",
    he: "תמונה קודמת",
    ar: "الصورة السابقة",
  },
  heroNextSlide: {
    en: "Next image",
    he: "תמונה הבאה",
    ar: "الصورة التالية",
  },
  footerSocial: { en: "Social", he: "רשתות חברתיות", ar: "التواصل الاجتماعي" },
  myOrders: { en: "My Orders", he: "ההזמנות שלי", ar: "طلباتي" },
  myOrdersEmpty: {
    en: "No orders yet.",
    he: "אין הזמנות עדיין.",
    ar: "لا توجد طلبات بعد.",
  },
  myOrdersSeeMore: {
    en: "See more orders",
    he: "הצג הזמנות נוספות",
    ar: "عرض المزيد من الطلبات",
  },
  loading: {
    en: "Loading…",
    he: "טוען…",
    ar: "جارٍ التحميل…",
  },
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
  checkout: { en: "Checkout", he: "סיום הזמנה", ar: "إتمام الطلب" },
  checkoutSubtitle: {
    en: "Complete your order and choose how you would like to receive it.",
    he: "סיימו את ההזמנה ובחרו כיצד תרצו לקבל אותה.",
    ar: "أكمل طلبك واختر طريقة استلامه.",
  },
  checkoutCustomerSection: {
    en: "Your details",
    he: "פרטי התקשרות",
    ar: "بياناتك",
  },
  checkoutCustomerDesc: {
    en: "We will use these details to confirm and fulfill your order.",
    he: "נשתמש בפרטים אלה לאישור ההזמנה ולמשלוח/איסוף.",
    ar: "سنستخدم هذه البيانات لتأكيد طلبك وتنفيذه.",
  },
  checkoutCouponSection: {
    en: "Coupon code",
    he: "קוד קופון",
    ar: "رمز القسيمة",
  },
  checkoutOrderNotes: {
    en: "Order notes",
    he: "הערות להזמנה",
    ar: "ملاحظات الطلب",
  },
  checkoutOrderNotesPlaceholder: {
    en: "Allergies, gift message, or special requests (optional)",
    he: "אלרגיות, ברכה למתנה או בקשות מיוחדות (אופציונלי)",
    ar: "حساسية، رسالة هدية، أو طلبات خاصة (اختياري)",
  },
  orderSummaryTitle: {
    en: "Order summary",
    he: "סיכום הזמנה",
    ar: "ملخص الطلب",
  },
  cashOnDeliveryTitle: {
    en: "Cash on pickup / delivery",
    he: "מזומן באיסוף / במשלוח",
    ar: "نقد عند الاستلام / التوصيل",
  },
  cashOnDeliveryDesc: {
    en: "Pay when you receive your order.",
    he: "תשלום בעת קבלת ההזמנה.",
    ar: "ادفع عند استلام طلبك.",
  },
  cardPaymentComingSoon: {
    en: "Pay by card will be available soon.",
    he: "תשלום בכרטיס אשראי יהיה זמין בקרוב.",
    ar: "الدفع بالبطاقة سيتوفر قريبًا.",
  },
  creditCardDesc: {
    en: "Secure payment via CardCom. You will be redirected to complete payment.",
    he: "תשלום מאובטח דרך CardCom. תועבר/י לדף תשלום להשלמת העסקה.",
    ar: "دفع آمن عبر CardCom. سيتم تحويلك لصفحة الدفع لإتمام العملية.",
  },
  cardPaymentRedirect: {
    en: "Redirecting to secure payment…",
    he: "מעביר לדף תשלום מאובטח…",
    ar: "جارٍ التحويل إلى صفحة الدفع الآمنة…",
  },
  cardPaymentFailed: {
    en: "Card payment was not completed. Please try again or choose cash.",
    he: "התשלום בכרטיס לא הושלם. נסה/י שוב או בחר/י מזומן.",
    ar: "لم يكتمل الدفع بالبطاقة. حاول مرة أخرى أو اختر الدفع نقدًا.",
  },
  cardPaymentSetupFailed: {
    en: "Could not open the payment page. Please try again or contact us.",
    he: "לא ניתן לפתוח את דף התשלום. נסה/י שוב או צור/י קשר.",
    ar: "تعذر فتح صفحة الدفع. حاول مرة أخرى أو تواصل معنا.",
  },
  cardPaymentUnavailable: {
    en: "Card payment is temporarily unavailable.",
    he: "תשלום בכרטיס אינו זמין כרגע.",
    ar: "الدفع بالبطاقة غير متاح حالياً.",
  },
  cardPaymentPending: {
    en: "Confirming your payment…",
    he: "מאשרים את התשלום…",
    ar: "جارٍ تأكيد الدفع…",
  },
  cardPaymentConfirmed: {
    en: "Payment confirmed. Thank you!",
    he: "התשלום אושר. תודה!",
    ar: "تم تأكيد الدفع. شكرًا لك!",
  },
  cardPaymentResumeTitle: {
    en: "Complete your card payment",
    he: "השלמת תשלום בכרטיס אשראי",
    ar: "إكمال الدفع بالبطاقة",
  },
  cardPaymentResumeBody: {
    en: "Your order was created but payment was not completed. You can return to the secure payment page to finish.",
    he: "ההזמנה נוצרה אך התשלום לא הושלם. ניתן לחזור לדף התשלום המאובטח ולהשלים.",
    ar: "تم إنشاء الطلب لكن الدفع لم يكتمل. يمكنك العودة إلى صفحة الدفع الآمنة لإتمامه.",
  },
  cardPaymentResumeAction: {
    en: "Continue to payment",
    he: "המשך לתשלום",
    ar: "متابعة إلى الدفع",
  },
  cardCartRestored: {
    en: "Payment was not completed. Your cart has been restored.",
    he: "התשלום לא הושלם. הסל שוחזר.",
    ar: "لم يكتمل الدفع. تمت استعادة السلة.",
  },
  cardCartRestoring: {
    en: "Restoring your cart…",
    he: "משחזר את הסל…",
    ar: "جارٍ استعادة السلة…",
  },
  comingSoon: { en: "Coming soon", he: "בקרוב", ar: "قريبًا" },
  couponAppliedSuccess: {
    en: "Coupon applied successfully",
    he: "הקופון הוחל בהצלחה",
    ar: "تم تطبيق القسيمة بنجاح",
  },
  placingOrder: {
    en: "Placing order…",
    he: "שולח הזמנה…",
    ar: "جارٍ تأكيد الطلب…",
  },
  backToCart: { en: "Back to cart", he: "חזרה לסל", ar: "العودة إلى السلة" },
  continueShopping: {
    en: "Continue shopping",
    he: "המשך קניות",
    ar: "متابعة التسوق",
  },
  invalidEmail: {
    en: "Please enter a valid email address",
    he: "יש להזין כתובת אימייל תקינה",
    ar: "يرجى إدخال بريد إلكتروني صالح",
  },
  orderConfirmationTitle: {
    en: "Thank you!",
    he: "תודה רבה!",
    ar: "شكرًا لك!",
  },
  orderConfirmationThanks: {
    en: "Your order has been received successfully.",
    he: "ההזמנה התקבלה בהצלחה.",
    ar: "تم استلام طلبك بنجاح.",
  },
  orderNumberLabel: { en: "Order number", he: "מספר הזמנה", ar: "رقم الطلب" },
  viewMyOrders: { en: "View my orders", he: "להזמנות שלי", ar: "عرض طلباتي" },
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
  receivingMethod: {
    en: "Receiving method",
    he: "אופן קבלת ההזמנה",
    ar: "طريقة استلام الطلب",
  },
  deliveryMethodTitle: {
    en: "Delivery Method",
    he: "אופן קבלת ההזמנה",
    ar: "طريقة استلام الطلب",
  },
  deliveryOptionTitle: {
    en: "Delivery to your address",
    he: "משלוח עד הבית",
    ar: "توصيل إلى العنوان",
  },
  deliveryOptionDesc: {
    en: "We deliver fresh orders straight to your door.",
    he: "נשלח את ההזמנה טרייה עד הבית.",
    ar: "نوصّل طلبك الطازج إلى عنوانك.",
  },
  deliveryMinOrder: {
    en: "Delivery is available for orders of at least ₪100.",
    he: "משלוח זמין להזמנות מ-₪100 ומעלה.",
    ar: "التوصيل متاح للطلبات بقيمة ₪100 على الأقل.",
  },
  deliveryMinOrderHint: {
    en: "Add more items to reach ₪100 for delivery.",
    he: "הוסיפו מוצרים עד ₪100 כדי לבחור משלוח.",
    ar: "أضف منتجات حتى ₪100 لاختيار التوصيل.",
  },
  pickupOptionTitle: {
    en: "Pickup from bakery",
    he: "איסוף עצמי מהמאפייה",
    ar: "استلام من المخبز",
  },
  pickupOptionDesc: {
    en: "Collect your order at our bakery when it is ready.",
    he: "איסוף ההזמנה במאפייה כשהיא מוכנה.",
    ar: "استلم طلبك من المخبز عندما يكون جاهزًا.",
  },
  deliveryFeeShort: { en: "delivery fee", he: "דמי משלוח", ar: "رسوم التوصيل" },
  deliveryFeeLabel: { en: "Delivery fee", he: "דמי משלוח", ar: "رسوم التوصيل" },
  deliveryAddressSection: {
    en: "Delivery address",
    he: "כתובת למשלוח",
    ar: "عنوان التوصيل",
  },
  deliveryAddressDialogTitle: {
    en: "Where should we deliver?",
    he: "לאן לשלוח את ההזמנה?",
    ar: "إلى أين نوصّل طلبك؟",
  },
  deliveryAddressDialogDesc: {
    en: "Enter your delivery details so we can bring your order fresh to your door.",
    he: "הזינו את פרטי המשלוח ונגיע אליכם עם ההזמנה טרייה.",
    ar: "أدخل تفاصيل التوصيل لنصل إليك بطلبك الطازج.",
  },
  confirmDeliveryAddress: {
    en: "Confirm address",
    he: "אישור כתובת",
    ar: "تأكيد العنوان",
  },
  saveAndContinue: {
    en: "Save & continue",
    he: "שמירה והמשך",
    ar: "حفظ ومتابعة",
  },
  editDeliveryAddress: {
    en: "Edit delivery address",
    he: "עריכת כתובת משלוח",
    ar: "تعديل عنوان التوصيل",
  },
  deliveryAddressSaved: {
    en: "Delivery address saved",
    he: "כתובת המשלוח נשמרה",
    ar: "تم حفظ عنوان التوصيل",
  },
  addDeliveryAddress: {
    en: "Add delivery address",
    he: "הוספת כתובת למשלוח",
    ar: "إضافة عنوان التوصيل",
  },
  addressCity: { en: "City", he: "עיר", ar: "المدينة" },
  addressStreet: { en: "Street", he: "רחוב", ar: "الشارع" },
  addressHouseNumber: { en: "House number", he: "מספר בית", ar: "رقم المنزل" },
  addressApartment: {
    en: "Apartment (optional)",
    he: "דירה (אופציונלי)",
    ar: "الشقة (اختياري)",
  },
  deliveryNotesLabel: {
    en: "Notes for delivery (optional)",
    he: "הערות למשלוח (אופציונלי)",
    ar: "ملاحظات للتوصيل (اختياري)",
  },
  optional: { en: "Optional", he: "אופציונלי", ar: "اختياري" },
  pickupInfoTitle: {
    en: "Pickup at the bakery",
    he: "איסוף במאפייה",
    ar: "الاستلام من المخبز",
  },
  pickupReadyMessage: {
    en: "Your order will be prepared and you can pick it up from the bakery.",
    he: "ההזמנה תוכן ותוכלו לאסוף אותה מהמאפייה.",
    ar: "سيتم تجهيز طلبك ويمكنك استلامه من المخبز.",
  },
  checkoutSummaryReceiving: {
    en: "Receiving method",
    he: "אופן קבלה",
    ar: "طريقة الاستلام",
  },
  checkoutSummaryPickupAddress: {
    en: "Pickup address",
    he: "כתובת איסוף",
    ar: "عنوان الاستلام",
  },
  selectDeliveryMethodError: {
    en: "Please choose delivery or pickup.",
    he: "יש לבחור משלוח או איסוף עצמי.",
    ar: "يرجى اختيار التوصيل أو الاستلام.",
  },
  deliveryAddressRequiredError: {
    en: "Please fill in city, street, and house number for delivery.",
    he: "יש למלא עיר, רחוב ומספר בית למשלוח.",
    ar: "يرجى تعبئة المدينة والشارع ورقم المنزل للتوصيل.",
  },
  checkoutContactRequired: {
    en: "Please fill in your name, phone, and email.",
    he: "יש למלא שם, טלפון ואימייל.",
    ar: "يرجى تعبئة الاسم والهاتف والبريد الإلكتروني.",
  },
  fieldRequired: { en: "Required", he: "שדה חובה", ar: "مطلوب" },
  phoneInvalidIsrael: {
    en: "Enter a valid 10-digit Israeli phone number (e.g. 0501234567)",
    he: "יש להזין מספר טלפון ישראלי תקין בן 10 ספרות (לדוגמה: 0501234567)",
    ar: "أدخل رقم هاتف إسرائيلي صالحاً مكوناً من 10 أرقام (مثال: 0501234567)",
  },
  nameMinLength: {
    en: "Name must be at least 2 characters",
    he: "השם חייב להכיל לפחות 2 תווים",
    ar: "يجب أن يحتوي الاسم على حرفين على الأقل",
  },
  placeOrder: { en: "Place order", he: "בצע הזמנה", ar: "تأكيد الطلب" },
  fullName: { en: "Full name", he: "שם מלא", ar: "الاسم الكامل" },
  phone: { en: "Phone", he: "טלפון", ar: "الهاتف" },
  email: { en: "Email", he: "אימייל", ar: "البريد الإلكتروني" },
  password: { en: "Password", he: "סיסמה", ar: "كلمة المرور" },
  forgotPasswordLink: {
    en: "Forgot password?",
    he: "שכחת סיסמה?",
    ar: "نسيت كلمة المرور؟",
  },
  forgotPassword: {
    en: "Forgot Password",
    he: "שחזור סיסמה",
    ar: "استعادة كلمة المرور",
  },
  forgotPasswordSubtitle: {
    en: "Enter your email and we will send you a link to reset your password.",
    he: "הזינו את האימייל ונשלח לכם קישור לאיפוס הסיסמה.",
    ar: "أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.",
  },
  sendResetLink: {
    en: "Send reset link",
    he: "שלח קישור לאיפוס",
    ar: "إرسال رابط إعادة التعيين",
  },
  sendingResetLink: {
    en: "Sending…",
    he: "שולח…",
    ar: "جارٍ الإرسال…",
  },
  passwordResetLinkSent: {
    en: "Password reset link sent. Please check your email.",
    he: "קישור לאיפוס סיסמה נשלח. בדקו את תיבת הדואר.",
    ar: "تم إرسال رابط إعادة تعيين كلمة المرور. تحقق من بريدك الإلكتروني.",
  },
  passwordResetRequestFailed: {
    en: "Could not send the reset link. Please try again later.",
    he: "לא ניתן לשלוח את קישור האיפוס. נסו שוב מאוחר יותר.",
    ar: "تعذر إرسال رابط إعادة التعيين. حاول مرة أخرى لاحقًا.",
  },
  passwordResetRedirectNotConfigured: {
    en: "Reset redirect URL is not configured. In Supabase add http://localhost:8080/reset-password under Authentication → URL Configuration → Redirect URLs.",
    he: "כתובת ההפניה לא מוגדרת. ב-Supabase הוסיפו http://localhost:8080/reset-password תחת Authentication → URL Configuration → Redirect URLs.",
    ar: "رابط إعادة التوجيه غير مُعد. في Supabase أضف http://localhost:8080/reset-password ضمن Authentication → URL Configuration → Redirect URLs.",
  },
  backToLogin: {
    en: "Back to login",
    he: "חזרה להתחברות",
    ar: "العودة لتسجيل الدخول",
  },
  createNewPassword: {
    en: "Create New Password",
    he: "יצירת סיסמה חדשה",
    ar: "إنشاء كلمة مرور جديدة",
  },
  newPassword: {
    en: "New password",
    he: "סיסמה חדשה",
    ar: "كلمة مرور جديدة",
  },
  confirmPassword: {
    en: "Confirm password",
    he: "אימות סיסמה",
    ar: "تأكيد كلمة المرور",
  },
  updatePassword: {
    en: "Update Password",
    he: "עדכן סיסמה",
    ar: "تحديث كلمة المرور",
  },
  updatingPassword: {
    en: "Updating…",
    he: "מעדכן…",
    ar: "جارٍ التحديث…",
  },
  passwordUpdatedSuccess: {
    en: "Your password has been updated successfully.",
    he: "הסיסמה עודכנה בהצלחה.",
    ar: "تم تحديث كلمة المرور بنجاح.",
  },
  resetLinkInvalidOrExpired: {
    en: "This reset link is invalid or expired. Please request a new one.",
    he: "קישור האיפוס לא תקף או שפג תוקפו. בקשו קישור חדש.",
    ar: "رابط إعادة التعيين غير صالح أو منتهي الصلاحية. اطلب رابطًا جديدًا.",
  },
  passwordHelp: {
    en: "Use at least 8 characters with letters and numbers for a stronger password.",
    he: "השתמשו לפחות ב-8 תווים, כולל אותיות ומספרים.",
    ar: "استخدم 8 أحرف على الأقل، مع حروف وأرقام لكلمة مرور أقوى.",
  },
  showPassword: { en: "Show password", he: "הצג סיסמה", ar: "إظهار كلمة المرور" },
  hidePassword: { en: "Hide password", he: "הסתר סיסמה", ar: "إخفاء كلمة المرور" },
  emailRequired: {
    en: "Please enter your email address.",
    he: "נא להזין כתובת אימייל.",
    ar: "يرجى إدخال بريدك الإلكتروني.",
  },
  passwordRequired: {
    en: "Please enter a new password.",
    he: "נא להזין סיסמה חדשה.",
    ar: "يرجى إدخال كلمة مرور جديدة.",
  },
  confirmPasswordRequired: {
    en: "Please confirm your password.",
    he: "נא לאמת את הסיסמה.",
    ar: "يرجى تأكيد كلمة المرور.",
  },
  passwordMinLength: {
    en: "Password must be at least 8 characters.",
    he: "הסיסמה חייבת להכיל לפחות 8 תווים.",
    ar: "يجب أن تكون كلمة المرور 8 أحرف على الأقل.",
  },
  passwordNeedsUppercase: {
    en: "Password must include at least one uppercase letter.",
    he: "הסיסמה חייבת לכלול לפחות אות גדולה אחת.",
    ar: "يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل.",
  },
  passwordNeedsLowercase: {
    en: "Password must include at least one lowercase letter.",
    he: "הסיסמה חייבת לכלול לפחות אות קטנה אחת.",
    ar: "يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل.",
  },
  passwordNeedsDigit: {
    en: "Password must include at least one number.",
    he: "הסיסמה חייבת לכלול לפחות ספרה אחת.",
    ar: "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل.",
  },
  passwordStrengthHelp: {
    en: "At least 8 characters, with uppercase, lowercase, and a number.",
    he: "לפחות 8 תווים, עם אות גדולה, אות קטנה ומספר.",
    ar: "8 أحرف على الأقل، مع حرف كبير وحرف صغير ورقم.",
  },
  nameInvalidChars: {
    en: "Name can only contain letters and spaces.",
    he: "השם יכול להכיל רק אותיות ורווחים.",
    ar: "الاسم يمكن أن يحتوي فقط على حروف ومسافات.",
  },
  passwordsMustMatch: {
    en: "Passwords do not match.",
    he: "הסיסמאות אינן תואמות.",
    ar: "كلمتا المرور غير متطابقتين.",
  },
  address: { en: "Delivery address", he: "כתובת למשלוח", ar: "عنوان التوصيل" },
  notes: { en: "Notes", he: "הערות", ar: "ملاحظات" },
  orderConfirmed: { en: "Order placed!", he: "ההזמנה התקבלה!", ar: "تم تأكيد الطلب!" },
  orderConfirmedWithEmail: {
    en: "Order placed successfully. A confirmation email will be sent if email service is available.",
    he: "ההזמנה התקבלה בהצלחה. מייל אישור יישלח אם שירות הדוא\"ל זמין.",
    ar: "تم تأكيد الطلب بنجاح. سيتم إرسال بريد تأكيد إذا كانت خدمة البريد متاحة.",
  },
  orderRedirectingHome: {
    en: "Order confirmed — taking you home…",
    he: "ההזמנה אושרה — מעבירים אותך לדף הבית…",
    ar: "تم تأكيد الطلب — جارٍ نقلك إلى الصفحة الرئيسية…",
  },
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
  outOfStock: {
    en: "Out of Stock",
    he: "אזל מהמלאי",
    ar: "نفذ من المخزون",
  },
  maxStockReached: {
    en: "Only {count} available in stock.",
    he: "רק {count} זמינים במלאי.",
    ar: "متوفر فقط {count} في المخزون.",
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
  invalidLoginCredentials: {
    en: "The email or password you entered is incorrect.",
    he: "האימייל או הסיסמה שהזנת שגויים.",
    ar: "البريد الإلكتروني أو كلمة المرور التي أدخلتها غير صحيحة.",
  },
  emailNotConfirmed: {
    en: "Please verify your email address before signing in.",
    he: "יש לאמת את כתובת האימייל שלך לפני ההתחברות.",
    ar: "يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول.",
  },
  emailAlreadyRegistered: {
    en: "An account with this email already exists.",
    he: "כבר קיים חשבון עם כתובת אימייל זו.",
    ar: "يوجد حساب بهذا البريد الإلكتروني بالفعل.",
  },
  phoneAlreadyRegistered: {
    en: "This phone number is already registered.",
    he: "מספר הטלפון הזה כבר רשום במערכת.",
    ar: "رقم الهاتف هذا مسجّل بالفعل.",
  },
  tooManyAuthAttempts: {
    en: "Too many attempts. Please wait a moment and try again.",
    he: "יותר מדי ניסיונות. אנא המתן רגע ונסה שוב.",
    ar: "محاولات كثيرة جداً. يرجى الانتظار قليلاً والمحاولة مجدداً.",
  },
  genericError: {
    en: "Something went wrong",
    he: "משהו השתבש",
    ar: "حدث خطأ ما",
  },
  invalidCoupon: { en: "Invalid coupon", he: "קופון לא תקין", ar: "قسيمة غير صالحة" },
  checkoutOneCoupon: {
    en: "Only one coupon per order. Change the code to replace it, or remove it.",
    he: "קופון אחד בלבד להזמנה. שינוי הקוד יחליף את הקופון, או הסירו אותו.",
    ar: "قسيمة واحدة فقط لكل طلب. غيّر الرمز لاستبدالها أو أزلها.",
  },
  couponRemoved: {
    en: "Coupon removed",
    he: "הקופון הוסר",
    ar: "تمت إزالة القسيمة",
  },
  couponRemoveAria: {
    en: "Remove coupon",
    he: "הסרת קופון",
    ar: "إزالة القسيمة",
  },
  checkoutCouponMissing: {
    en: "Please apply your coupon again.",
    he: "יש להחיל את הקופון מחדש.",
    ar: "يرجى تطبيق القسيمة مرة أخرى.",
  },
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
  resendConfirmationEmail: {
    en: "Resend Confirmation Email",
    he: "שלח מחדש אישור הזמנה",
    ar: "إعادة إرسال بريد التأكيد",
  },
  sendingEmail: {
    en: "Sending…",
    he: "שולח…",
    ar: "جارٍ الإرسال…",
  },
  emailResentSuccess: {
    en: "Confirmation email sent",
    he: "אישור ההזמנה נשלח",
    ar: "تم إرسال بريد التأكيد",
  },
  emailAlreadySent: {
    en: "Email was already sent",
    he: "המייל כבר נשלח",
    ar: "البريد الإلكتروني أُرسل بالفعل",
  },
  emailSendFailed: {
    en: "Could not send email",
    he: "שגיאה בשליחת המייל",
    ar: "تعذّر إرسال البريد الإلكتروني",
  },
  orderStatusEmailSent: {
    en: "Status email sent to customer",
    he: "עדכון סטטוס נשלח ללקוח",
    ar: "تم إرسال بريد الحالة للعميل",
  },
  orderStatusEmailFailed: {
    en: "Order updated — status email failed",
    he: "ההזמנה עודכנה — שגיאה בשליחת עדכון הסטטוס",
    ar: "تم تحديث الطلب — فشل إرسال بريد الحالة",
  },
  imageUploaded: { en: "Image uploaded", he: "התמונה הועלתה", ar: "تم رفع الصورة" },
  uploadFileTooLarge: {
    en: "File is too large. Maximum size is 5 MB.",
    he: "הקובץ גדול מדי. הגודל המקסימלי הוא 5 MB.",
    ar: "الملف كبير جدًا. الحجم الأقصى هو 5 ميغابايت.",
  },
  uploadInvalidType: {
    en: "Invalid file type. Only JPEG, PNG, WebP and AVIF images are allowed.",
    he: "סוג קובץ לא חוקי. מותרים רק תמונות JPEG, PNG, WebP ו-AVIF.",
    ar: "نوع الملف غير صالح. يُسمح فقط بصور JPEG وPNG وWebP وAVIF.",
  },
  uploadInvalidDimensions: {
    en: "Image is too large. Maximum dimensions are 4000 × 4000 px.",
    he: "התמונה גדולה מדי. המידות המקסימליות הן 4000 × 4000 פיקסל.",
    ar: "الصورة كبيرة جدًا. الأبعاد القصوى هي 4000 × 4000 بكسل.",
  },
  subjectBodyRequired: {
    en: "Subject and message are required",
    he: "נדרשים נושא והודעה",
    ar: "الموضوع والرسالة مطلوبان",
  },
  mustSignIn: { en: "You must be signed in", he: "יש להתחבר", ar: "يجب تسجيل الدخول" },
  emailCampaignSavedTitle: {
    en: "Campaign saved (no emails sent yet).",
    he: "הקמפיין נשמר (עדיין לא נשלחו מיילים).",
    ar: "تم حفظ الحملة (لم يُرسل بريد بعد).",
  },
  emailCampaignResendHint: {
    en: "Add RESEND_API_KEY and RESEND_FROM_EMAIL to the server environment (see .env.example), then redeploy.",
    he: "הוסיפו RESEND_API_KEY ו-RESEND_FROM_EMAIL לסביבת השרת (ראו .env.example) ופרסמו מחדש.",
    ar: "أضف RESEND_API_KEY و RESEND_FROM_EMAIL إلى بيئة الخادم (راجع .env.example) ثم أعد النشر.",
  },
  emailCampaignSentTitle: {
    en: "Campaign sent",
    he: "הקמפיין נשלח",
    ar: "تم إرسال الحملة",
  },
  emailCampaignSentDesc: {
    en: "Delivered to {{n}} inbox(es).",
    he: "נשלח ל-{{n}} כתובות.",
    ar: "تم التسليم إلى {{n}} بريد.",
  },
  emailCampaignPartialTitle: {
    en: "Campaign saved — some emails failed",
    he: "הקמפיין נשמר — חלק מהמיילים נכשלו",
    ar: "تم حفظ الحملة — فشل إرسال بعض الرسائل",
  },
  emailCampaignPartialDesc: {
    en: "Sent: {{sent}}, failed: {{failed}}. Check Resend dashboard and domain verification.",
    he: "נשלחו: {{sent}}, נכשלו: {{failed}}. בדקו ב-Resend אימות דומיין.",
    ar: "أُرسل: {{sent}}، فشل: {{failed}}. راجع لوحة Resend والتحقق من النطاق.",
  },
  emailCampaignSendError: {
    en: "Could not send the campaign.",
    he: "לא ניתן לשלוח את הקמפיין.",
    ar: "تعذر إرسال الحملة.",
  },
  adminOffersForbidden: {
    en: "You do not have permission to send campaigns.",
    he: "אין לך הרשאה לשלוח קמפיינים.",
    ar: "ليس لديك صلاحية لإرسال الحملات.",
  },
  emailCampaignInvalidFromEnv: {
    en: "RESEND_FROM_EMAIL must be a real sender address (e.g. Al-Nour Bakery <onboarding@resend.dev>), not your website URL.",
    he: "RESEND_FROM_EMAIL חייב להיות כתובת שולח אמיתית (למשל Al-Nour Bakery <onboarding@resend.dev>), לא כתובת האתר.",
    ar: "يجب أن يكون RESEND_FROM_EMAIL بريد مرسل حقيقي (مثل Al-Nour Bakery <onboarding@resend.dev>) وليس رابط الموقع.",
  },
  emailCampaignNoSubscribersToEmail: {
    en: "Campaign saved. There are no active subscribers to email yet.",
    he: "הקמפיין נשמר. אין עדיין מנויים פעילים לשליחה.",
    ar: "تم حفظ الحملة. لا يوجد مشتركون نشطون لإرسال البريد إليهم بعد.",
  },
  emailTestModeTitle: {
    en: "Email sending is in test mode",
    he: "שליחת דוא\"ל במצב בדיקה",
    ar: "إرسال البريد في وضع الاختبار",
  },
  emailTestModeDesc: {
    en: "Without a verified domain, emails can only be sent to the Resend account email. Verify a custom domain in Resend and update RESEND_FROM_EMAIL for production (e.g. orders@alnourbakery.com).",
    he: "ללא דומיין מאומת, ניתן לשלוח מיילים רק לכתובת חשבון Resend. לאימות דומיין ב-Resend עדכנו RESEND_FROM_EMAIL (למשל orders@alnourbakery.com).",
    ar: "بدون نطاق موثّق، يمكن الإرسال فقط إلى بريد حساب Resend. بعد التحقق من النطاق في Resend، حدّث RESEND_FROM_EMAIL (مثل orders@alnourbakery.com).",
  },
  adminOffersTestRecipientOnly: {
    en: "Test recipient only (development)",
    he: "נמען בדיקה בלבד (פיתוח)",
    ar: "مستلم اختبار فقط (تطوير)",
  },
  adminOffersTestRecipientHint: {
    en: "{{n}} subscribers on file — emails will NOT be sent to them until domain is verified.",
    he: "{{n}} מנויים רשומים — לא יישלח אליהם עד אימות דומיין.",
    ar: "{{n}} مشتركين مسجلون — لن يُرسل إليهم حتى التحقق من النطاق.",
  },
  adminOffersTestEmailLabel: {
    en: "Test / recipient email",
    he: "מייל בדיקה / נמען",
    ar: "بريد الاختبار / المستلم",
  },
  adminOffersTestEmailPlaceholder: {
    en: "your-resend-account@gmail.com",
    he: "your-resend-account@gmail.com",
    ar: "your-resend-account@gmail.com",
  },
  adminOffersTestEmailHint: {
    en: "Leave blank to use ADMIN_EMAIL from server env. Required for Resend sandbox.",
    he: "השאירו ריק לשימוש ב-ADMIN_EMAIL מהשרת. נדרש ל-sandbox של Resend.",
    ar: "اتركه فارغًا لاستخدام ADMIN_EMAIL من الخادم. مطلوب لبيئة Resend التجريبية.",
  },
  adminOffersDiscountPercentLabel: {
    en: "Discount percentage (optional)",
    he: "אחוז הנחה (אופציונלי)",
    ar: "نسبة الخصم (اختياري)",
  },
  adminOffersDiscountOff: {
    en: "off",
    he: "הנחה",
    ar: "خصم",
  },
  adminOffersRecipientsCount: {
    en: "{{n}} recipient(s)",
    he: "{{n}} נמענים",
    ar: "{{n}} مستلم",
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
  adminPanelSubtitle: {
    en: "Welcome back — here's what's happening at the bakery today.",
    he: "ברוכים השבים — הנה מה שקורה היום במאפייה.",
    ar: "مرحبًا بعودتك — إليك ما يحدث في المخبز اليوم.",
  },
  adminAppName: {
    en: "Al-nour Admin",
    he: "ניהול אלנור",
    ar: "إدارة النور",
  },
  adminNavDashboard: {
    en: "Dashboard",
    he: "לוח בקרה",
    ar: "لوحة التحكم",
  },
  adminNavInventory: {
    en: "Inventory",
    he: "מלאי וקטלוג",
    ar: "المخزون",
  },
  adminNavOrders: {
    en: "Shop orders",
    he: "הזמנות מהחנות",
    ar: "طلبات المتجر",
  },
  adminNavCustomers: {
    en: "Customers",
    he: "לקוחות ומייל",
    ar: "العملاء والبريد",
  },
  adminNavSettings: {
    en: "Store settings",
    he: "הגדרות חנות",
    ar: "إعدادات المتجر",
  },
  adminSettingsTitle: {
    en: "Store settings",
    he: "הגדרות חנות",
    ar: "إعدادات المتجر",
  },
  adminSettingsSubtitle: {
    en: "Manage bakery-wide options for checkout and delivery.",
    he: "ניהול אפשרויות כלליות לתשלום ולמשלוח.",
    ar: "إدارة خيارات المخبز للدفع والتوصيل.",
  },
  adminDeliverySettingsTitle: {
    en: "Delivery settings",
    he: "הגדרות משלוח",
    ar: "إعدادات التوصيل",
  },
  adminDeliverySettingsDesc: {
    en: "Set the delivery price that customers will see during checkout.",
    he: "קבעו את מחיר המשלוח שיוצג ללקוחות בתשלום.",
    ar: "حدّد سعر التوصيل الذي يراه العملاء عند إتمام الطلب.",
  },
  adminDeliveryFeeLabel: {
    en: "Delivery fee",
    he: "דמי משלוח",
    ar: "رسوم التوصيل",
  },
  adminDeliveryFeePlaceholder: {
    en: "Enter delivery price",
    he: "הזינו מחיר משלוח",
    ar: "أدخل سعر التوصيل",
  },
  adminDeliveryFeeHint: {
    en: "Must be 0 or greater. Pickup orders are always free.",
    he: "חייב להיות 0 ומעלה. הזמנות איסוף עצמי ללא דמי משלוח.",
    ar: "يجب أن يكون 0 أو أكثر. طلبات الاستلام من المخبز مجانية.",
  },
  adminDeliveryFeeSave: {
    en: "Save delivery price",
    he: "שמירת מחיר משלוח",
    ar: "حفظ سعر التوصيل",
  },
  adminDeliveryFeeSaving: {
    en: "Saving…",
    he: "שומר…",
    ar: "جارٍ الحفظ…",
  },
  adminDeliveryFeeSaved: {
    en: "Delivery price saved successfully",
    he: "מחיר המשלוח נשמר בהצלחה",
    ar: "تم حفظ سعر التوصيل بنجاح",
  },
  adminDeliveryFeeInvalid: {
    en: "Enter a valid number (0 or greater)",
    he: "יש להזין מספר תקין (0 ומעלה)",
    ar: "أدخل رقمًا صالحًا (0 أو أكثر)",
  },
  adminDeliverySettingsNote: {
    en: "Delivery place prices apply to new checkouts immediately. Each order stores the area name and fee charged at checkout.",
    he: "מחירי אזורי המשלוח חלים על הזמנות חדשות מיד. כל הזמנה שומרת את שם האזור ודמי המשלוח שנגבו בקופה.",
    ar: "تُطبَّق أسعار مناطق التوصيل على الطلبات الجديدة فورًا. كل طلب يحفظ اسم المنطقة ورسوم التوصيل وقت الدفع.",
  },
  carouselPrev: { en: "Previous products", he: "מוצרים קודמים", ar: "المنتجات السابقة" },
  carouselNext: { en: "Next products", he: "מוצרים הבאים", ar: "المنتجات التالية" },
  adminHomepageSectionsTitle: {
    en: "Homepage category sections",
    he: "מדורי קטגוריות בדף הבית",
    ar: "أقسام الفئات في الصفحة الرئيسية",
  },
  adminHomepageSectionsDesc: {
    en: "Choose which categories appear on the homepage and in what order. Empty categories are hidden automatically.",
    he: "בחרו אילו קטגוריות יופיעו בדף הבית ובאיזה סדר. קטגוריות ריקות לא יוצגו.",
    ar: "اختر الفئات التي تظهر في الصفحة الرئيسية وترتيبها. الفئات الفارغة تُخفى تلقائياً.",
  },
  adminHomepageSectionsSave: { en: "Save section order", he: "שמירת סדר המדורים", ar: "حفظ ترتيب الأقسام" },
  adminHomepageSectionsSaving: { en: "Saving…", he: "שומר…", ar: "جارٍ الحفظ…" },
  adminHomepageSectionsSaved: {
    en: "Homepage section order saved",
    he: "סדר המדורים נשמר",
    ar: "تم حفظ ترتيب الأقسام",
  },
  adminHomepageSectionsEmpty: {
    en: "No categories yet — add categories and products in Admin.",
    he: "אין קטגוריות עדיין — הוסיפו קטגוריות ומוצרים בניהול.",
    ar: "لا توجد فئات بعد — أضف فئات ومنتجات من الإدارة.",
  },
  adminHomepageSectionsProductCount: {
    en: "products",
    he: "מוצרים",
    ar: "منتجات",
  },
  adminHomepageSectionsMoveUp: { en: "Move up", he: "הזז למעלה", ar: "تحريك لأعلى" },
  adminHomepageSectionsMoveDown: { en: "Move down", he: "הזז למטה", ar: "تحريك لأسفل" },
  adminDashSettingsTitle: {
    en: "Store settings",
    he: "הגדרות חנות",
    ar: "إعدادات المتجر",
  },
  adminDashSettingsDesc: {
    en: "Delivery fee and checkout options",
    he: "דמי משלוח והגדרות תשלום",
    ar: "رسوم التوصيل وخيارات الدفع",
  },
  adminResourceLinkSettings: {
    en: "Open settings",
    he: "פתיחת הגדרות",
    ar: "فتح الإعدادات",
  },
  adminRoleShopManager: {
    en: "Shop manager",
    he: "מנהל/ת החנות",
    ar: "مدير المتجر",
  },
  adminBackToShop: {
    en: "View storefront",
    he: "מעבר לאתר החנות",
    ar: "عرض واجهة المتجر",
  },
  adminOrdersBellOpen: {
    en: "Shop orders",
    he: "הזמנות מהחנות",
    ar: "طلبات المتجر",
  },
  adminOrdersBellAriaWithPending: {
    en: "{{n}} orders need attention — open orders",
    he: "{{n}} הזמנות ממתינות — פתיחת הזמנות",
    ar: "{{n}} طلبات تحتاج متابعة — افتح الطلبات",
  },
  adminOrdersBellAriaClear: {
    en: "Orders — nothing waiting at checkout",
    he: "הזמנות — אין הזמנות ממתינות כרגע",
    ar: "الطلبات — لا يوجد طلبات قيد الانتظار",
  },
  adminDashResourceSection: {
    en: "Resource management",
    he: "ניהול משאבים",
    ar: "إدارة الموارد",
  },
  adminSearchPlaceholder: {
    en: "Search sections…",
    he: "חיפוש במקטעים…",
    ar: "البحث في الأقسام…",
  },
  adminKpiBadgeLive: {
    en: "Live",
    he: "חי",
    ar: "مباشر",
  },
  adminKpiBadgeInStock: {
    en: "In stock",
    he: "במלאי",
    ar: "متوفر",
  },
  adminKpiBadgeActive: {
    en: "Active",
    he: "פעיל",
    ar: "نشط",
  },
  adminKpiBadgeAllTime: {
    en: "All time",
    he: "מצטבר",
    ar: "كل الفترات",
  },
  adminResourceLinkProducts: {
    en: "Explore catalog",
    he: "לקטלוג",
    ar: "استكشف الكتالوج",
  },
  adminResourceLinkCategories: {
    en: "Manage tags",
    he: "ניהול קטגוריות",
    ar: "إدارة الوسوم",
  },
  adminResourceLinkOrders: {
    en: "Recent orders",
    he: "הזמנות אחרונות",
    ar: "أحدث الطلبات",
  },
  adminResourceLinkCoupons: {
    en: "Active promos",
    he: "מבצעים פעילים",
    ar: "العروض النشطة",
  },
  adminResourceLinkOffers: {
    en: "Audience list",
    he: "רשימת קהל",
    ar: "قائمة الجمهور",
  },
  adminResourceLinkReports: {
    en: "Export data",
    he: "נתונים ודוחות",
    ar: "البيانات والتصدير",
  },
  adminViewAllOrders: {
    en: "View all orders",
    he: "כל ההזמנות",
    ar: "عرض كل الطلبات",
  },
  adminOrdersColRef: {
    en: "Order ref",
    he: "מזהה",
    ar: "مرجع الطلب",
  },
  adminOrdersColCustomer: {
    en: "Customer",
    he: "לקוח",
    ar: "العميل",
  },
  adminOrdersColStatus: {
    en: "Status",
    he: "סטטוס",
    ar: "الحالة",
  },
  adminOrdersColDate: {
    en: "Date",
    he: "תאריך",
    ar: "التاريخ",
  },
  adminOrdersColTotal: {
    en: "Total",
    he: "סה״כ",
    ar: "الإجمالي",
  },
  adminOpenMenu: {
    en: "Open admin menu",
    he: "פתיחת תפריט ניהול",
    ar: "فتح قائمة الإدارة",
  },
  adminNoMatchingSections: {
    en: "No sections match your search.",
    he: "אין מקטעים התואמים לחיפוש.",
    ar: "لا توجد أقسام مطابقة للبحث.",
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
    en: "Form to add or edit a catalog product: category, name, descriptions, ingredients, and allergens in English, Hebrew, Arabic, plus price, image, and availability.",
    he: "טופס להוספה או עריכת מוצר בקטלוג: קטגוריה, שם, תיאור, מרכיבים ואלרגנים בשלוש שפות, מחיר, תמונה וזמינות.",
    ar: "نموذج لإضافة منتج أو تعديله في الكتالوج: الفئة والاسم والوصف والمكونات ومسببات الحساسية بثلاث لغات والسعر والصورة والتوفر.",
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
  adminProductSaveChanges: {
    en: "Save changes",
    he: "שמור שינויים",
    ar: "حفظ التغييرات",
  },
  adminGalleryColumnMissingWarning: {
    en: "Product saved, but extra gallery photos were not stored. In Supabase: open SQL Editor and run: ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gallery_urls text[] NOT NULL DEFAULT '{}'; then NOTIFY pgrst, 'reload schema';",
    he: "המוצר נשמר, אך תמונות הגלריה הנוספות לא נשמרו. בסופאבייס: SQL Editor והרצת ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gallery_urls text[] NOT NULL DEFAULT '{}'; ואז NOTIFY pgrst, 'reload schema';",
    ar: "تم حفظ المنتج دون صور المعرض الإضافية. في Supabase نفّذ في محرر SQL: ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gallery_urls text[] NOT NULL DEFAULT '{}'; ثم NOTIFY pgrst, 'reload schema';",
  },
  adminProductAddImage: {
    en: "Add image",
    he: "הוסף תמונה",
    ar: "إضافة صورة",
  },
  adminProductImagesSection: {
    en: "Product images",
    he: "תמונות מוצר",
    ar: "صور المنتج",
  },
  adminProductAvailability: {
    en: "Availability",
    he: "זמינות",
    ar: "التوفر",
  },
  adminProductChangeCover: {
    en: "Change main photo",
    he: "החלפת תמונה ראשית",
    ar: "تغيير الصورة الرئيسية",
  },
  adminProductBackForm: {
    en: "Close form",
    he: "סגירת הטופס",
    ar: "إغلاق النموذج",
  },
  adminProductSaveForm: {
    en: "Save product",
    he: "שמירת מוצר",
    ar: "حفظ المنتج",
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
    en: "Selling price (₪)",
    he: "מחיר מכירה (₪)",
    ar: "سعر البيع (₪)",
  },
  adminLabelCompareAtPriceNis: {
    en: "Original price before discount (₪, optional)",
    he: "מחיר לפני הנחה (₪, אופציונלי)",
    ar: "السعر قبل الخصم (₪، اختياري)",
  },
  adminCompareAtPriceHint: {
    en: "If higher than the selling price, the shop shows it crossed out next to the current price.",
    he: "אם גבוה ממחיר המכירה, החנות תציג אותו עם קו חוצה ליד המחיר הנוכחי.",
    ar: "إذا كان أعلى من سعر البيع، يظهر في المتجر مشطوبًا بجانب السعر الحالي.",
  },
  adminCompareAtMustExceedSelling: {
    en: "Original price must be higher than the selling price (or leave it empty).",
    he: "מחיר לפני הנחה חייב להיות גבוה ממחיר המכירה (או השאר ריק).",
    ar: "يجب أن يكون السعر قبل الخصم أعلى من سعر البيع (أو اتركه فارغًا).",
  },
  priceAccessibleWas: {
    en: "Former price",
    he: "מחיר קודם",
    ar: "السعر السابق",
  },
  priceAccessibleNow: {
    en: "now",
    he: "עכשיו",
    ar: "الآن",
  },
  adminLabelStockInternal: {
    en: "Stock (internal — not shown to customers)",
    he: "מלאי (פנימי — לא מוצג ללקוחות)",
    ar: "المخزون (داخلي — لا يظهر للعملاء)",
  },
  adminLabelStock: {
    en: "Stock Quantity",
    he: "כמות במלאי",
    ar: "الكمية في المخزون",
  },
  adminStockHint: {
    en: "Set to 0 to show the product as out of stock.",
    he: "הגדר 0 כדי להציג את המוצר כאזל מהמלאי.",
    ar: "اضبط على 0 لعرض المنتج كنفذ من المخزون.",
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
  adminOrderDeliveryLine: { en: "Delivery fee", he: "דמי משלוח", ar: "رسوم التوصيل" },
  adminOrderFulfillmentDelivery: {
    en: "Delivery to customer",
    he: "משלוח ללקוח",
    ar: "توصيل للعميل",
  },
  adminOrderFulfillmentPickup: {
    en: "Pickup from bakery",
    he: "איסוף עצמי מהמאפייה",
    ar: "استلام من المخبز",
  },
  adminOrderPickupLocation: {
    en: "Pickup location",
    he: "מיקום איסוף",
    ar: "موقع الاستلام",
  },
  adminOrderDiscountLine: { en: "Discount", he: "הנחה", ar: "الخصم" },
  adminOrderTotalLine: { en: "Total", he: "סה״כ", ar: "الإجمالي" },
  adminOrderMobileProducts: {
    en: "Products",
    he: "מוצרים",
    ar: "المنتجات",
  },
  adminOrderMobileMoreSuffix: {
    en: "more in this order",
    he: "פריטים נוספים בהזמנה",
    ar: "المزيد في هذا الطلب",
  },
  adminOrderMobileViewDetails: {
    en: "View details",
    he: "צפייה בפרטים",
    ar: "عرض التفاصيل",
  },
  adminOrderMobileTotalQty: {
    en: "Total quantity",
    he: "סה״כ יחידות",
    ar: "إجمالي الكمية",
  },
  adminOrdersStatTodayCount: {
    en: "Today's orders",
    he: "הזמנות היום",
    ar: "طلبات اليوم",
  },
  adminOrdersStatTodaySales: {
    en: "Today's sales",
    he: "מכירות היום",
    ar: "مبيعات اليوم",
  },
  adminOrdersStatVsYesterday: {
    en: "vs yesterday",
    he: "לעומת אתמול",
    ar: "مقارنة بالأمس",
  },
  adminOrdersStatSame: {
    en: "Same as yesterday",
    he: "כמו אתמול",
    ar: "كالأمس",
  },
  adminOrdersTabAll: { en: "All orders", he: "כל ההזמנות", ar: "كل الطلبات" },
  adminOrdersTabNew: { en: "New", he: "חדשות", ar: "جديدة" },
  adminOrdersTabPreparing: { en: "Preparing", he: "בהכנה", ar: "قيد التحضير" },
  adminOrdersTabReady: { en: "Ready", he: "מוכנות", ar: "جاهزة" },
  adminOrdersTabCompleted: { en: "Completed", he: "הושלמו", ar: "مكتملة" },
  adminOrdersTabCancelled: { en: "Cancelled", he: "בוטלו", ar: "ملغاة" },
  adminOrdersNoMatch: {
    en: "No orders in this filter.",
    he: "אין הזמנות בסינון זה.",
    ar: "لا توجد طلبات في هذا التصفية.",
  },
  adminOrderDetailPlaced: { en: "Placed", he: "הוזמן", ar: "تاريخ الطلب" },
  adminOrderDetailUpdated: { en: "Updated", he: "עודכן", ar: "آخر تحديث" },
  adminOrderDetailPaymentStatus: {
    en: "Payment status",
    he: "סטטוס תשלום",
    ar: "حالة الدفع",
  },
  adminOrderDetailSectionItems: {
    en: "Line items",
    he: "פריטים",
    ar: "بنود الطلب",
  },
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
    en: "Send campaign",
    he: "שליחת קמפיין",
    ar: "إرسال الحملة",
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
  adminOffersPageSubtitle: {
    en: "Create and send beautiful offers to your subscribers.",
    he: "צרו ושלחו הצעות יפות למנויים שלכם.",
    ar: "أنشئوا وأرسلوا عروضًا جميلة للمشتركين.",
  },
  adminOffersTemplatesBtn: {
    en: "Templates",
    he: "תבניות",
    ar: "قوالب",
  },
  adminOffersChooseTemplate: {
    en: "Choose a template",
    he: "בחרו תבנית",
    ar: "اختر قالبًا",
  },
  adminOffersViewAllTemplates: {
    en: "View all",
    he: "הצג הכול",
    ar: "عرض الكل",
  },
  adminOffersTagDiscount: {
    en: "Discount",
    he: "הנחה",
    ar: "خصم",
  },
  adminOffersTagSeasonal: {
    en: "Seasonal",
    he: "עונתי",
    ar: "موسمي",
  },
  adminOffersTagAnnouncement: {
    en: "Announcement",
    he: "הכרזה",
    ar: "إعلان",
  },
  adminOffersTplWeekendTitle: {
    en: "Weekend 20% OFF",
    he: "סוף שבוע 20% הנחה",
    ar: "خصم 20% لعطلة نهاية الأسبوع",
  },
  adminOffersTplRamadanTitle: {
    en: "Ramadan offer 15% OFF",
    he: "מבצע רמדאן 15% הנחה",
    ar: "عرض رمضان خصم 15٪",
  },
  adminOffersTplLaunchTitle: {
    en: "New product launch",
    he: "השקת מוצר חדש",
    ar: "إطلاق منتج جديد",
  },
  adminOffersTplWeekendSubject: {
    en: "Enjoy 20% off this weekend!",
    he: "תיהנו מ-20% הנחה בסוף השבוע!",
    ar: "استمتعوا بخصم 20٪ هذا الأسبوع!",
  },
  adminOffersTplRamadanSubject: {
    en: "Ramadan blessings — 15% off bakery favorites",
    he: "ברכות רמדאן — 15% הנחה על מועדפי המאפייה",
    ar: "رمضان كريم — خصم 15٪ على مفضلات المخبز",
  },
  adminOffersTplLaunchSubject: {
    en: "Just dropped: new gluten-free treats",
    he: "חדש על המדף: פינוקים ללא גלוטן",
    ar: "وصل حديثًا: حلويات خالية من الجلوتين",
  },
  adminOffersTplWeekendBody: {
    en: "Hello! This weekend only, take 20% off your order with the coupon below. Fresh gluten-free breads and pastries are waiting for you.",
    he: "שלום! בסוף השבוע הזה בלבד — 20% הנחה על ההזמנה עם הקופון למטה. לחמים ומאפים טריים ללא גלוטן מחכים לכם.",
    ar: "مرحبًا! خصم 20٪ على طلبك هذا الأسبوع فقط باستخدام القسيمة أدناه. أخبز ومخبوزات خالية من الجلوتين في انتظاركم.",
  },
  adminOffersTplRamadanBody: {
    en: "Warm wishes for Ramadan. Enjoy 15% off selected items this month — use the code at checkout.",
    he: "ברכות חמות לרמדאן. 15% הנחה על פריטים נבחרים החודש — השתמשו בקוד בתשלום.",
    ar: "أطيب التمنيات بمناسبة رمضان. خصم 15٪ على أصناف مختارة هذا الشهر — استخدموا الرمز عند الدفع.",
  },
  adminOffersTplLaunchBody: {
    en: "We are excited to introduce our newest gluten-free brownies and cakes. Order this week and taste the difference!",
    he: "אנחנו מתרגשים להציג את הבראוניז והעוגות החדשות ללא גלוטן. הזמינו השבוע וטעמו את ההבדל!",
    ar: "يسرنا تقديم أحدث براونيز وكيك خالية من الجلوتين. اطلبوا هذا الأسبوع وذوقوا الفرق!",
  },
  adminOffersAudience: {
    en: "Audience",
    he: "קהל",
    ar: "الجمهور",
  },
  adminOffersAllSubscribersCount: {
    en: "All subscribers ({{n}})",
    he: "כל המנויים ({{n}})",
    ar: "كل المشتركين ({{n}})",
  },
  adminOffersScheduleTitle: {
    en: "Schedule",
    he: "תזמון",
    ar: "الجدولة",
  },
  adminOffersSendNow: {
    en: "Send now",
    he: "שליחה עכשיו",
    ar: "إرسال الآن",
  },
  adminOffersScheduleLater: {
    en: "Schedule for later",
    he: "תזמון לימים הבאים",
    ar: "جدولة لاحقًا",
  },
  adminOffersSchedulePickTime: {
    en: "Date & time",
    he: "תאריך ושעה",
    ar: "التاريخ والوقت",
  },
  adminOffersScheduleComingToast: {
    en: "Scheduled sending is not available yet. Choose “Send now” to deliver this campaign.",
    he: "שליחה מתוזמנת עדיין לא זמינה. בחרו \"שליחה עכשיו\" כדי לשלוח את הקמפיין.",
    ar: "الإرسال المجدول غير متاح بعد. اختروا «إرسال الآن» لإرسال هذه الحملة.",
  },
  adminOffersPreviewTitle: {
    en: "Email preview",
    he: "תצוגת מייל",
    ar: "معاينة البريد",
  },
  adminOffersViewFullPreview: {
    en: "View full preview",
    he: "תצוגה מלאה",
    ar: "معاينة كاملة",
  },
  adminOffersPreviewDialogTitle: {
    en: "Campaign preview",
    he: "תצוגת קמפיין",
    ar: "معاينة الحملة",
  },
  adminOffersSendEmailOffer: {
    en: "Send email offer",
    he: "שליחת הצעה במייל",
    ar: "إرسال عرض البريد",
  },
  adminOffersAllTemplatesTitle: {
    en: "All templates",
    he: "כל התבניות",
    ar: "كل القوالب",
  },
  adminOffersAudienceIncludes: {
    en: "Includes all active subscribers.",
    he: "כולל את כל המנויים הפעילים.",
    ar: "يشمل كل المشتركين النشطين.",
  },
  adminOffersSubjectLine: {
    en: "Subject line",
    he: "שורת נושא",
    ar: "سطر الموضوع",
  },
  adminOffersAddTemplate: {
    en: "Add template",
    he: "הוספת תבנית",
    ar: "إضافة قالب",
  },
  adminOffersNewTemplateDialogTitle: {
    en: "New email template",
    he: "תבנית מייל חדשה",
    ar: "قالب بريد جديد",
  },
  adminOffersTemplateTitleField: {
    en: "Card title",
    he: "כותרת כרטיס",
    ar: "عنوان البطاقة",
  },
  adminOffersTemplateTagField: {
    en: "Tag (e.g. Discount)",
    he: "תג (למשל הנחה)",
    ar: "وسم (مثل خصم)",
  },
  adminOffersTemplateImageUrlField: {
    en: "Image URL (optional)",
    he: "כתובת תמונה (אופציונלי)",
    ar: "رابط صورة (اختياري)",
  },
  adminOffersTemplateTintField: {
    en: "Card style",
    he: "סגנון כרטיס",
    ar: "نمط البطاقة",
  },
  adminOffersTintGreen: { en: "Forest green", he: "ירוק יער", ar: "أخضر غامق" },
  adminOffersTintAmber: { en: "Warm gold", he: "זהב חם", ar: "ذهبي دافئ" },
  adminOffersTintBrown: { en: "Chocolate", he: "שוקולד", ar: "شوكولاتي" },
  adminOffersTintSlate: { en: "Soft slate", he: "אפור רך", ar: "رمادي ناعم" },
  adminOffersSaveTemplate: {
    en: "Save template",
    he: "שמירת תבנית",
    ar: "حفظ القالب",
  },
  adminOffersDeleteTemplate: {
    en: "Remove",
    he: "הסרה",
    ar: "إزالة",
  },
  adminOffersTemplateSaved: {
    en: "Template saved on this device.",
    he: "התבנית נשמרה במכשיר זה.",
    ar: "تم حفظ القالب على هذا الجهاز.",
  },
  adminOffersTemplatesStorageNote: {
    en: "Custom templates are stored in this browser only. Clearing site data removes them.",
    he: "תבניות מותאמות נשמרות בדפדפן זה בלבד. מחיקת נתוני האתר תסיר אותן.",
    ar: "القوالب المخصصة تُحفظ في هذا المتصفح فقط. مسح بيانات الموقع يزيلها.",
  },
  adminOffersImageUrlHttpsOnly: {
    en: "Image URL must start with https://",
    he: "כתובת התמונה חייבת להתחיל ב-https://",
    ar: "يجب أن يبدأ رابط الصورة بـ https://",
  },
  adminOffersTemplateRemoved: {
    en: "Template removed.",
    he: "התבנית הוסרה.",
    ar: "تمت إزالة القالب.",
  },
  adminOffersImmediateSendHint: {
    en: "Sends immediately when you tap the button below.",
    he: "נשלח מיד בלחיצה על הכפתור למטה.",
    ar: "يُرسل فورًا عند الضغط على الزر أدناه.",
  },
  adminMetricRevenue: { en: "Total revenue", he: "סה״כ הכנסות", ar: "إجمالي الإيرادات" },
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
  adminMetricSubscribers: {
    en: "Subscribers",
    he: "מנויים למייל",
    ar: "المشتركون",
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

export const DEFAULT_LANG: Lang = "he";

export const isRTL = (lang: Lang) => lang === "he" || lang === "ar";

interface I18nContext {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof dict) => string;
  dir: "ltr" | "rtl";
}

const I18nCtx = createContext<I18nContext | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    if (typeof window === "undefined" || !allowsPreferencesStorage()) return;
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved && ["en", "he", "ar"].includes(saved)) setLangState(saved);
  }, []);

  useEffect(() => {
    const onPreferencesRevoked = () => setLangState(DEFAULT_LANG);
    window.addEventListener(PREFERENCES_REVOKED_EVENT, onPreferencesRevoked);
    return () => window.removeEventListener(PREFERENCES_REVOKED_EVENT, onPreferencesRevoked);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = isRTL(lang) ? "rtl" : "ltr";
    }
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined" && allowsPreferencesStorage()) {
      localStorage.setItem("lang", l);
    }
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
export function pickDesc(
  p: {
    description?: string | null;
    description_en?: string | null;
    description_he?: string | null;
    description_ar?: string | null;
  },
  lang: Lang,
) {
  const en = (p.description_en ?? "").trim();
  const he = (p.description_he ?? "").trim();
  const ar = (p.description_ar ?? "").trim();
  const legacy = (p.description ?? "").trim();

  if (lang === "he" && he) return he;
  if (lang === "ar" && ar) return ar;
  if (lang === "en" && en) return en;

  return en || he || ar || legacy;
}

export function pickAllergens(
  p: {
    allergens?: string | null;
    allergens_en?: string | null;
    allergens_he?: string | null;
    allergens_ar?: string | null;
  },
  lang: Lang,
) {
  const en = (p.allergens_en ?? "").trim();
  const he = (p.allergens_he ?? "").trim();
  const ar = (p.allergens_ar ?? "").trim();
  const legacy = (p.allergens ?? "").trim();

  if (lang === "he" && he) return he;
  if (lang === "ar" && ar) return ar;
  if (lang === "en" && en) return en;

  return en || he || ar || legacy;
}

export function pickIngredients(
  p: {
    ingredients?: string | null;
    ingredients_en?: string | null;
    ingredients_he?: string | null;
    ingredients_ar?: string | null;
  },
  lang: Lang,
) {
  const en = (p.ingredients_en ?? "").trim();
  const he = (p.ingredients_he ?? "").trim();
  const ar = (p.ingredients_ar ?? "").trim();
  const legacy = (p.ingredients ?? "").trim();

  if (lang === "he" && he) return he;
  if (lang === "ar" && ar) return ar;
  if (lang === "en" && en) return en;

  return en || he || ar || legacy;
}
