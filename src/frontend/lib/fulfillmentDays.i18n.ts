export const fulfillmentDaysDict = {
  orderAvailabilityTitle: {
    en: "Order availability",
    he: "זמינות הזמנות",
    ar: "توفر الطلبات",
  },
  pickupDaysTitle: {
    en: "Pickup days",
    he: "ימי איסוף עצמי",
    ar: "أيام الاستلام الذاتي",
  },
  deliveryDaysTitle: {
    en: "Delivery days",
    he: "ימי משלוחים",
    ar: "أيام التوصيل",
  },
  choosePickupDay: {
    en: "Choose your pickup day",
    he: "בחר יום איסוף",
    ar: "اختر يوم الاستلام",
  },
  chooseDeliveryDay: {
    en: "Choose your delivery day",
    he: "בחר יום משלוח",
    ar: "اختر يوم التوصيل",
  },
  choosePickupDate: {
    en: "Choose pickup date",
    he: "בחר תאריך איסוף",
    ar: "اختر تاريخ الاستلام",
  },
  chooseDeliveryDate: {
    en: "Choose delivery date",
    he: "בחר תאריך משלוח",
    ar: "اختر تاريخ التوصيل",
  },
  availableDatesTitle: {
    en: "Available dates",
    he: "תאריכים זמינים",
    ar: "التواريخ المتاحة",
  },
  selectDate: {
    en: "Select date",
    he: "בחר תאריך",
    ar: "اختر التاريخ",
  },
  changeDate: {
    en: "Change date",
    he: "שנה תאריך",
    ar: "تغيير التاريخ",
  },
  changeAddress: {
    en: "Change address",
    he: "שנה כתובת",
    ar: "تغيير العنوان",
  },
  pickupScheduledFor: {
    en: "Pickup",
    he: "איסוף נקבע ל־",
    ar: "تم تحديد الاستلام في",
  },
  deliveryScheduledFor: {
    en: "Delivery",
    he: "משלוח נקבע ל־",
    ar: "تم تحديد التوصيل في",
  },
  fulfillmentDateRequired: {
    en: "Please choose a date before placing the order",
    he: "יש לבחור תאריך לפני ביצוע ההזמנה",
    ar: "يجب اختيار تاريخ قبل إتمام الطلب",
  },
  availabilitySavedSuccess: {
    en: "Availability saved successfully",
    he: "הזמינות נשמרה בהצלחה",
    ar: "تم حفظ التوفر بنجاح",
  },
  availabilityMinOneDay: {
    en: "You must keep at least one available day enabled",
    he: "חייב להשאיר לפחות יום אחד זמין",
    ar: "يجب إبقاء يوم واحد متاح على الأقل",
  },
  noAvailableDates: {
    en: "No available dates right now.",
    he: "אין תאריכים זמינים כרגע.",
    ar: "لا توجد تواريخ متاحة حالياً.",
  },
  adminOrderAvailabilityTitle: {
    en: "Pickup & Delivery Availability",
    he: "זמינות איסוף ומשלוח",
    ar: "توفر الاستلام والتوصيل",
  },
  adminOrderAvailabilitySubtitle: {
    en: "Set recurring weekdays and manage specific dates for the next two weeks.",
    he: "הגדרת ימי שבוע קבועים וניהול תאריכים ספציפיים לשבועיים הקרובים.",
    ar: "تعيين أيام الأسبوع المتكررة وإدارة تواريخ محددة للأسبوعين القادمين.",
  },
  pickupAvailabilityTitle: {
    en: "Pickup availability",
    he: "זמינות איסוף",
    ar: "توفر الاستلام",
  },
  deliveryAvailabilityTitle: {
    en: "Delivery availability",
    he: "זמינות משלוחים",
    ar: "توفر التوصيل",
  },
  dateChoosePrompt: {
    en: "Choose when you would like to receive your order.",
    he: "בחרו מתי תרצו לקבל את ההזמנה.",
    ar: "اختر متى تريد استلام طلبك.",
  },
  dateNotSelected: {
    en: "No date selected yet",
    he: "טרם נבחר תאריך",
    ar: "لم يتم اختيار التاريخ بعد",
  },
  adminOrderAvailabilitySave: {
    en: "Save availability",
    he: "שמירת זמינות",
    ar: "حفظ التوفر",
  },
  adminOrderAvailabilitySaving: {
    en: "Saving…",
    he: "שומר…",
    ar: "جارٍ الحفظ…",
  },
  adminOrderAvailabilityLoadError: {
    en: "Could not load availability settings.",
    he: "לא ניתן לטעון את הגדרות הזמינות.",
    ar: "تعذّر تحميل إعدادات التوفر.",
  },
  adminOrderAvailabilityMigrationHint: {
    en: "The database table is missing. Open Supabase → SQL Editor, run the file supabase/apply_fulfillment_available_days.sql, then refresh this page.",
    he: "טבלת מסד הנתונים חסרה. פתחו Supabase → SQL Editor, הריצו את הקובץ supabase/apply_fulfillment_available_days.sql, ורעננו את הדף.",
    ar: "جدول قاعدة البيانات مفقود. افتح Supabase → SQL Editor، شغّل الملف supabase/apply_fulfillment_available_days.sql، ثم حدّث الصفحة.",
  },
  adminOrderAvailabilityNote: {
    en: "Changes apply to new checkouts immediately. Existing orders keep their scheduled date.",
    he: "השינוי חל על הזמנות חדשות מיד. הזמנות קיימות שומרות את התאריך שנבחר.",
    ar: "تُطبَّق التغييرات على الطلبات الجديدة فوراً. الطلبات السابقة تحتفظ بتاريخها المجدول.",
  },
  adminUpcomingDatesTitle: {
    en: "Upcoming two weeks",
    he: "שבועיים קרובים",
    ar: "الأسبوعان القادمان",
  },
  adminUpcomingDatesDescription: {
    en: "Tap a date to close or reopen it. Closed dates won't appear at checkout.",
    he: "לחצו על תאריך לסגירה או פתיחה. תאריכים סגורים לא יופיעו בדף ההזמנה.",
    ar: "اضغط على تاريخ لإغلاقه أو إعادة فتحه. التواريخ المغلقة لن تظهر عند الدفع.",
  },
  adminDateOpen: {
    en: "Open",
    he: "פתוח",
    ar: "مفتوح",
  },
  adminDateClosed: {
    en: "Closed",
    he: "סגור",
    ar: "مغلق",
  },
  adminNoUpcomingDates: {
    en: "No dates in the next two weeks. Enable at least one weekday above.",
    he: "אין תאריכים בשבועיים הקרובים. הפעילו לפחות יום אחד למעלה.",
    ar: "لا توجد تواريخ في الأسبوعين القادمين. فعّل يومًا واحدًا على الأقل أعلاه.",
  },
  adminDateToggledOpen: {
    en: "Date reopened",
    he: "התאריך נפתח",
    ar: "تم إعادة فتح التاريخ",
  },
  adminDateToggledClosed: {
    en: "Date closed",
    he: "התאריך נסגר",
    ar: "تم إغلاق التاريخ",
  },
  adminRecurringDaysTitle: {
    en: "Recurring weekdays",
    he: "ימי שבוע קבועים",
    ar: "أيام الأسبوع المتكررة",
  },
  adminRecurringDaysDescription: {
    en: "Which days of the week are open every week. Add Wednesday here if you decide to open on Wednesdays too.",
    he: "אילו ימי שבוע פתוחים בכל שבוע. הוסיפו רביעי כאן אם תחליטו לפתוח גם בימי רביעי.",
    ar: "أيام الأسبوع المفتوحة كل أسبوع. أضف الأربعاء هنا إذا قررتم فتح المخبز يوم الأربعاء أيضًا.",
  },
  adminDashAvailabilityTitle: {
    en: "Order availability",
    he: "זמינות הזמנות",
    ar: "توفر الطلبات",
  },
  adminDashAvailabilityDesc: {
    en: "Configure recurring weekdays and close specific dates for the next two weeks.",
    he: "הגדרת ימי שבוע קבועים וסגירת תאריכים ספציפיים לשבועיים הקרובים.",
    ar: "تكوين أيام الأسبوع المتكررة وإغلاق تواريخ محددة للأسبوعين القادمين.",
  },
  adminResourceLinkAvailability: {
    en: "Manage availability",
    he: "ניהול זמינות",
    ar: "إدارة التوفر",
  },
  adminOrderScheduledDate: {
    en: "Scheduled date",
    he: "תאריך מתוכנן",
    ar: "التاريخ المجدول",
  },
  checkoutSummaryScheduledDate: {
    en: "Scheduled for",
    he: "מתוכנן ל",
    ar: "مجدول لـ",
  },
  weekdaySunday: { en: "Sunday", he: "יום ראשון", ar: "الأحد" },
  weekdayMonday: { en: "Monday", he: "יום שני", ar: "الاثنين" },
  weekdayTuesday: { en: "Tuesday", he: "יום שלישי", ar: "الثلاثاء" },
  weekdayWednesday: { en: "Wednesday", he: "יום רביעי", ar: "الأربعاء" },
  weekdayThursday: { en: "Thursday", he: "יום חמישי", ar: "الخميس" },
  weekdayFriday: { en: "Friday", he: "יום שישי", ar: "الجمعة" },
  weekdaySaturday: { en: "Saturday", he: "יום שבת", ar: "السبت" },
} as const;

export type WeekdayDictKey =
  | "weekdaySunday"
  | "weekdayMonday"
  | "weekdayTuesday"
  | "weekdayWednesday"
  | "weekdayThursday"
  | "weekdayFriday"
  | "weekdaySaturday";

export const WEEKDAY_DICT_KEYS: WeekdayDictKey[] = [
  "weekdaySunday",
  "weekdayMonday",
  "weekdayTuesday",
  "weekdayWednesday",
  "weekdayThursday",
  "weekdayFriday",
  "weekdaySaturday",
];
