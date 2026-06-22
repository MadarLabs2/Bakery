import { LEGAL_PLACEHOLDERS } from "@/config/legalPlaceholders";

export type GuideBlock = {
  title: string;
  paragraphs?: string[];
  listItems?: string[];
};

export type AccessibilityGuideContent = {
  pageTitle: string;
  lastUpdatedLabel: string;
  lastUpdated: string;
  statementLinkLabel: string;
  statementLinkUrl: string;
  blocks: GuideBlock[];
};

const {
  bakeryName,
  email,
  phone,
  websiteUrl,
  accessibilityEffectiveDate,
} = LEGAL_PLACEHOLDERS;

export const accessibilityGuideHe: AccessibilityGuideContent = {
  pageTitle: "מדריך נגישות — מאפיית אלנור ללא גלוטן",
  lastUpdatedLabel: "עדכון אחרון:",
  lastUpdated: accessibilityEffectiveDate,
  statementLinkLabel: "הצהרת הנגישות המלאה באתר:",
  statementLinkUrl: `${websiteUrl}/accessibility`,
  blocks: [
    {
      title: "מבוא",
      paragraphs: [
        "מרחב האינטרנט מהווה פלטפורמה לביטוי עצמי ולייצוג; הוא משמש אותנו כזירה חברתית ומסחרית. אנו קונים ומוכרים, עובדים ומציגים את עצמנו דרכו יותר מאי פעם. לפיכך, קיימת חובה לאפשר לציבור חוויית גלישה נעימה וקלה ככל האפשר.",
        `ב${bakeryName} (מאפיית אלנור ללא גלוטן) השקענו משאבים רבים כדי להנגיש אתר זה, כדי לאפשר חוויית גלישה לכלל האוכלוסייה ולאנשים עם מוגבלויות בפרט. המוטו המנחה אותנו הוא כבוד האדם וחירותו — אבן יסוד בחברה הישראלית, שבה לכולנו זכויות שוות ואנו שווים במהותנו.`,
      ],
    },
    {
      title: "שימוש ברכיב הנגישות",
      paragraphs: [
        "אתר זה משלב את תוסף הנגישות Enable, המסייע להנגשת האתר לאנשים עם מוגבלויות.",
        "לחצו על כפתור הנגישות (סמל הנגישות) בכל עמוד כדי לפתוח את תפריט ההתאמות.",
      ],
    },
    {
      title: "מדריך למשתמש — אפשרויות בתפריט",
      listItems: [
        "כפתור להתאמת האתר ותגיות האתר למכשירים וטכנולוגיות מסייעות",
        "כפתור להפעלת ניווט מקלדת בין הקישורים באתר",
        "כפתור לביטול הבהובים ו/או אלמנטים נעים על המסך",
        "כפתור להפעלת מצב שחור-לבן מונוכרומטי לעיוורי צבעים",
        "כפתור ספיה (גוון חום)",
        "כפתור ניגודיות גבוהה",
        "כפתור שחור וצהוב",
        "כפתור היפוך צבעים",
        "כפתור להדגשה ברורה של כל תגיות הכותרות באתר",
        "כפתור להדגשה ברורה של כל הקישורים באתר",
        "כפתור להצגת התיאור החלופי של התמונות במעבר עכבר",
        "כפתור להצגה קבועה של תיאורי התמונות באתר",
        "כפתור לביטול שימוש בגופן קריא",
        "כפתור להגדלת גודל הפונט באתר",
        "כפתור להקטנת גודל הפונט באתר",
        "כפתור להגדלת התצוגה כולה בכ-200%",
        "כפתור להקטנת התצוגה עד כ-70%",
        "כפתור להגדלת סמן העכבר",
        "כפתור להגדלת סמן העכבר ושינוי צבעו לשחור",
        "כפתור מצב קריאה באתר",
        "כפתור להצגת הצהרת הנגישות",
        "כפתור איפוס — מבטל את התאמות הנגישות",
        "כפתור לשליחת משוב נגישות",
        "כפתור לשינוי שפת סרגל הנגישות והצהרה בהתאם",
      ],
    },
    {
      title: "קיצורי מקלדת",
      paragraphs: [
        "בסרגל הנגישות קיימים שני סוגי הגדלה. להגדלת טקסט נוספת ניתן להשתמש בקיצורי המקלדת הבאים:",
      ],
      listItems: [
        "מקש Esc — פותח וסוגר את סרגל הנגישות",
        "Ctrl + — מגדיל את הטקסט באתר",
        "Ctrl – — מקטין את הטקסט באתר",
        "Ctrl 0 — מחזיר את האתר לגודל המקורי",
        "רווח (Space) — גולל את העמוד למטה",
        "F11 — מסך מלא (לחיצה נוספת ליציאה)",
      ],
    },
    {
      title: "למען הסר ספק",
      paragraphs: [
        "אנו מחויבים להנגיש את אתרנו לכלל האנשים, עם מוגבלות ובלי מוגבלות. באתר זה תמצאו טכנולוגיה המותאמת לצרכיכם. האתר מיועד לשימוש הציבור הרחב ככל האפשר.",
        "ייתכן שתמצאו אלמנטים שאינם נגישים במלואם, שטרם הונגשו או שלא נמצאה עבורם טכנולוגיה מתאימה; עם זאת, אנו פועלים ללא הרף לשפר את הנגישות ברמה גבוהה.",
        "אם נתקלתם בקושי בגלישה או בצפייה בתוכן באתר — אנו מתנצלים ונשמח אם תפנו אלינו.",
        "תוסף Enable מסייע בחלק מדרישות הנגישות ואינו מחליף התאמות מובנות באתר.",
      ],
    },
    {
      title: "הצהרת נגישות על ידי בעל האתר",
      paragraphs: [
        `שם העסק: ${bakeryName} (מאפיית אלנור ללא גלוטן)`,
        `כתובת האתר: ${websiteUrl}`,
        `עדכון אחרון: ${accessibilityEffectiveDate}`,
        "אנו מפעילים מאפייה ללא גלוטן עם חנות מקוונת — ניתן לגלוש במוצרים, לבצע הזמנות, לבחור משלוח או איסוף מהמאפייה, לפתוח חשבון וליצור קשר. השקענו משאבים בהנגשת האתר לחוויית גלישה נוחה, שוויונית ועצמאית.",
        'אתר זה נבנה כדי לעמוד בדרישות תקנות שוויון זכויות לאנשים עם מוגבלויות (התאמות נגישות לשירות), התשע"ג–2013, ובהמלצות תקן ישראלי ת"י 5568 ברמת AA, על פי WCAG 2.1.',
        "התאמות עיקריות: תוסף Enable, ניווט מקלדת, תאימות לקוראי מסך, עיצוב רספונסיבי, תמיכה בעברית/ערבית/אנגלית עם RTL, קישור «דלג לתוכן הראשי», תוויות לטפסים והודעות שגיאה.",
        "ניתן לפנות בטלפון, בוואטסאפ או במייל לקבלת עזרה בבחירת מוצרים, השלמת הזמנה, מעקב משלוח, תיאום איסוף או שאלות בנושא ללא גלוטן ואלרגנים.",
      ],
    },
    {
      title: "פרטי רכז/ת הנגישות בארגון",
      paragraphs: [
        `${bakeryName}`,
        `דואר אלקטרוני: ${email}`,
        `טלפון / WhatsApp: ${phone}`,
        `הצהרה מלאה: ${websiteUrl}/accessibility`,
      ],
    },
  ],
};

export const accessibilityGuideEn: AccessibilityGuideContent = {
  pageTitle: "Accessibility Guide — Al-Nour Gluten-Free Bakery",
  lastUpdatedLabel: "Last updated:",
  lastUpdated: accessibilityEffectiveDate,
  statementLinkLabel: "Full accessibility statement on the website:",
  statementLinkUrl: `${websiteUrl}/accessibility`,
  blocks: [
    {
      title: "Introduction",
      paragraphs: [
        "The internet is a platform for self-expression and representation; it serves us as a social and commercial space. We buy and sell, work, and present ourselves through it more than ever before. Therefore, we are committed to providing the public with as pleasant and easy a browsing experience as possible.",
        `At ${bakeryName} we invest significant resources to make this website accessible, so that everyone — including people with disabilities — can browse comfortably. The value that guides us is human dignity and freedom — a cornerstone of Israeli society, where we are all equal in rights and in essence.`,
      ],
    },
    {
      title: "Using the accessibility component",
      paragraphs: [
        "This website incorporates the Enable accessibility plugin, which helps make the site accessible for people with disabilities.",
        "Click the accessibility button (accessibility icon) on any page to open the adjustments menu.",
      ],
    },
    {
      title: "User guide — menu options",
      listItems: [
        "Button to adapt the site and site tags for assistive devices and technologies",
        "Button to enable keyboard navigation between links on the site",
        "Button to disable flashing and/or moving elements on the screen",
        "Button to enable black-and-white monochrome mode for color-blind users",
        "Sepia (brown tone) button",
        "High contrast button",
        "Black and yellow button",
        "Color inversion button",
        "Button to clearly highlight all heading tags on the site",
        "Button to clearly highlight all links on the site",
        "Button to show image alt text on mouse hover",
        "Button to show permanent image descriptions on the site",
        "Button to disable readable font",
        "Button to increase font size on the site",
        "Button to decrease font size on the site",
        "Button to enlarge the entire display to ~200%",
        "Button to shrink the entire display to ~70%",
        "Button to enlarge the mouse cursor",
        "Button to enlarge the mouse cursor and change its color to black",
        "Reading mode button",
        "Button to display the accessibility statement",
        "Reset button — cancels accessibility adjustments",
        "Send accessibility feedback button",
        "Button to change the toolbar and accessibility statement language",
      ],
    },
    {
      title: "Keyboard shortcuts",
      paragraphs: [
        "The accessibility toolbar offers two types of enlargement. To enlarge text further, you may also use these keyboard shortcuts:",
      ],
      listItems: [
        "Esc — opens and closes the accessibility toolbar",
        "Ctrl + — increases text size on the site",
        "Ctrl – — decreases text size on the site",
        "Ctrl 0 — restores the site to its original size",
        "Space — scrolls the page down",
        "F11 — full screen (press again to exit)",
      ],
    },
    {
      title: "For the avoidance of doubt",
      paragraphs: [
        "We are committed to making our website accessible to all people, with and without disabilities. On this site you will find technology suited to your needs. This site is intended for the general public to the fullest extent possible.",
        "You may find elements that are not yet fully accessible because they have not been adapted or because suitable technology was not found; nevertheless, we strive continuously to improve accessibility at a high standard.",
        "If you have difficulty browsing or viewing content on this site, we apologize and would appreciate your letting us know.",
        "The Enable plugin assists with part of accessibility requirements and does not replace built-in accessibility measures on the site.",
      ],
    },
    {
      title: "Accessibility statement by the site owner",
      paragraphs: [
        `Business name: ${bakeryName}`,
        `Website: ${websiteUrl}`,
        `Last updated: ${accessibilityEffectiveDate}`,
        "We operate a gluten-free bakery with an online store — you can browse products, place orders, choose delivery or pickup from the bakery, create an account, and contact us. We have invested resources in making the website accessible for a comfortable, equitable, and independent browsing experience.",
        "This website is designed to meet Israel’s Equal Rights for Persons with Disabilities Regulations (Service Accessibility Adjustments), 5773-2013, and Israeli Standard SI 5568 at Level AA, in line with WCAG 2.1.",
        "Main measures: Enable plugin, keyboard navigation, screen reader support, responsive design, Hebrew/Arabic/English with RTL, “Skip to main content” link, form labels, and clear error messages.",
        "You may call, WhatsApp, or email for help choosing products, completing an order, tracking delivery, scheduling pickup, or questions about gluten-free and allergen information.",
      ],
    },
    {
      title: "Accessibility coordinator contact details",
      paragraphs: [
        bakeryName,
        `Email: ${email}`,
        `Phone / WhatsApp: ${phone}`,
        `Full statement: ${websiteUrl}/accessibility`,
      ],
    },
  ],
};
