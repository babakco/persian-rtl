# سیاست حریم خصوصی — Persian-RTL

**آخرین به‌روزرسانی:** ۲۳ نوامبر ۲۰۲۶ (2026-11-23)
**نسخهٔ افزونه:** 1.2.0

## خلاصهٔ یک‌خطی

Persian-RTL هیچ داده‌ای از شما جمع‌آوری، ذخیره یا ارسال نمی‌کند. تنها چیزی که در مرورگر شما نگه داشته می‌شود، وضعیت «روشن/خاموش» خودِ افزونه است.

---

## ۱) مسئول داده

- **شرکت:** Abadis Dynamic Technology (نام کوتاه: AD-Tech)
- **شخص تماس:** Mehdi Ravanbakhsh
- **ایمیل تماس:** `<SUPPORT_EMAIL>`

## ۲) افزونه چه کار می‌کند

Persian-RTL روی یک فهرست داخلی از ۱۸ سرویس AI مطرح (ChatGPT، Gemini، Claude، Copilot، Meta AI، Muse، DeepSeek، Grok، Perplexity، Le Chat، Qwen، Poe، You.com، Character.AI، Pi) و روی دامنه‌هایی که خودتان اضافه می‌کنید دو تغییر ظاهری اعمال می‌کند. هر سایت را می‌توانید از فهرست حذف کنید. دو حالت اختیاری هم وجود دارد: «پوشش خودکار» که دامنه‌های شبیه سرویس‌های AI را پوشش می‌دهد، و «اعمال روی همهٔ سایت‌ها» که افزونه را روی هر صفحه‌ای فعال می‌کند.

1. فونت متن را به وزیرمتن تغییر می‌دهد.
2. پاراگراف‌هایی که حرف فارسی دارند را راست‌به‌چپ نمایش می‌دهد.

برای این کار، متن صفحه **در همان مرورگر شما و فقط در همان لحظه** خوانده می‌شود تا مشخص شود هر پاراگراف فارسی است یا نه. این متن‌ها **هیچ‌گاه ارسال، ذخیره یا ثبت نمی‌شوند**.

## ۳) داده‌هایی که جمع‌آوری می‌کنیم

**هیچ.**

نه حساب کاربری، نه ایمیل، نه متن گفت‌وگوها، نه تاریخ مرور، نه شناسهٔ تبلیغاتی، نه آمار استفاده. افزونه هیچ سروری ندارد و هیچ درخواستی برای ارسال داده نمی‌فرستد.

## ۴) داده‌هایی که در مرورگر شما نگه داشته می‌شود

چهار مقدار کوچک و فقط دربارهٔ تنظیمات خود افزونه در حافظهٔ مرورگر (`chrome.storage.sync`) ذخیره می‌شود:

- `enabled`: آیا افزونه روشن است یا خاموش.
- `customSites`: فهرست دامنه‌هایی که خودتان اضافه کرده‌اید.
- `disabledSites`: فهرست سایت‌های پیش‌فرضی که حذف کرده‌اید.
- `autoDetect`: آیا «پوشش خودکار سایت‌های AI» روشن است.
- `allSites`: آیا حالت «اعمال روی همهٔ سایت‌ها» روشن است.

این مقادیر هیچ متنی از گفت‌وگوها یا صفحه‌ها را در خود ندارند. اگر همگام‌سازی Chrome روشن باشد، خودِ مرورگر همین تنظیمات را بین دستگاه‌های شما همگام می‌کند (بخشی از سرویس Google، نه افزونه). با حذف افزونه پاک می‌شوند.

## ۵) مجوزهایی که افزونه می‌گیرد و دلیلشان

| مجوز | دلیل |
| --- | --- |
| اجرا در صفحه‌های چت (host permissions) | افزونه باید داخل این صفحه‌ها متن را بخواند تا جهت پاراگراف را تشخیص دهد و فونت را اعمال کند. |
| `storage` | ذخیرهٔ وضعیت روشن/خاموش و فهرست سایت‌ها (تنظیمات افزونه). |
| `scripting` | اجرای افزونه روی دامنه‌های دلخواهی که خودِ کاربر در تنظیمات اضافه می‌کند. |
| `activeTab` | اعمال افزونه روی همان تبی که کاربر روی آیکون کلیک کرده است. |
| دسترسی اختیاری به دامنه‌ها | سه کاربرد، همه با انتخاب کاربر: افزودن یک دامنهٔ دلخواه از تنظیمات (فقط برای همان دامنه)، روشن‌کردن «پوشش خودکار»، و روشن‌کردن «اعمال روی همهٔ سایت‌ها». دو مورد آخر به اجازهٔ گسترده نیاز دارند و با خاموش‌کردنشان پس گرفته می‌شوند. هیچ‌کدام در زمان نصب داده نمی‌شوند. |

## ۶) درخواست‌های شبکه

افزونه در حالت عادی هیچ درخواست شبکه‌ای ندارد؛ فونت وزیرمتن همراه خود افزونه است.

در یک حالت استثنا، اگر تنظیمات امنیتی سایت (CSP) اجازهٔ بارگذاری فونت داخلی افزونه را ندهد، فونت از سرویس عمومی **jsDelivr** (`cdn.jsdelivr.net`) خوانده می‌شود. این درخواست فقط یک فایل فونت است و هیچ متنی از صفحه یا گفت‌وگوهای شما در آن فرستاده نمی‌شود؛ مانند هر درخواست اینترنتی دیگر، آدرس IP و مشخصات فنی مرورگر برای آن سرور قابل مشاهده است.

## ۷) اشتراک‌گذاری با دیگران

هیچ داده‌ای با هیچ شخص یا شرکتی به اشتراک گذاشته، فروخته یا معامله نمی‌شود — چون اساساً داده‌ای جمع نمی‌شود.

## ۸) تبلیغات و ردیابی

افزونه هیچ شبکهٔ تبلیغاتی، ابزار تحلیل آماری، پیکسل ردیابی یا کد شخص ثالثی ندارد.

## ۹) کودکان

افزونه برای کودکان زیر ۱۳ سال طراحی نشده و هیچ اطلاعاتی از هیچ گروه سنی جمع نمی‌کند.

## ۱۰) تغییرات این سیاست

اگر روزی رفتار افزونه تغییر کند (مثلاً قابلیتی اضافه شود که به سرور نیاز داشته باشد)، این صفحه پیش از انتشار آن نسخه به‌روز می‌شود و تاریخ بالای صفحه تغییر می‌کند. نسخهٔ منتشرشده در Chrome Web Store همیشه همان چیزی است که در این صفحه توضیح داده شده.

## ۱۱) تماس

هر پرسشی دربارهٔ حریم خصوصی: `<SUPPORT_EMAIL>`

---

# Privacy Policy — Persian-RTL

**Last updated:** 23 November 2026
**Extension version:** 1.2.0

## Summary

Persian-RTL does not collect, store or transmit any personal data. The only value kept on your device is whether the extension is switched on.

## 1. Data controller

- **Company:** Abadis Dynamic Technology (AD-Tech)
- **Contact person:** Mehdi Ravanbakhsh
- **Email:** `<SUPPORT_EMAIL>`

## 2. What the extension does

Persian-RTL works on a built-in list of 18 well-known AI services (ChatGPT, Gemini, Claude, Copilot, Meta AI, Muse, DeepSeek, Grok, Perplexity, Le Chat, Qwen, Poe, You.com, Character.AI, Pi) and on any domain the user adds. The user can switch any site off. Two optional modes exist: auto-detect covers domains that look like AI services, and "apply on every website" runs the extension on every page. The extension changes presentation only: the Vazirmatn typeface and right-to-left paragraphs that contain Persian letters.

To decide the direction of a paragraph, the page text is inspected **locally, in your browser, at that moment**. That text is never sent, stored or logged anywhere.

## 3. Data we collect

**None.** No account, no email, no conversation content, no browsing history, no advertising identifier, no usage analytics. The extension has no backend and sends no telemetry.

## 4. Data stored in your browser

Four small keys that describe the extension's own settings in `chrome.storage.sync`:

- `enabled` — whether the extension is on.
- `customSites` — domains the user added.
- `disabledSites` — built-in sites the user removed.
- `autoDetect` — whether the auto-detect mode is on.
- `allSites` — whether the "apply on every website" mode is on.

They contain no conversation or page content. If the user has Chrome sync enabled, the browser itself syncs these settings between their devices (part of Google's service, not the extension). They are removed when the extension is uninstalled.

## 5. Permissions and why they are needed

| Permission | Why |
| --- | --- |
| Host access to chat sites | The content script must read page text inside those pages to detect Persian letters and apply the font. |
| `storage` | Keep the on/off state and the user's site list between sessions. |
| `scripting` | Apply the extension on chat domains the user adds manually. |
| `activeTab` | Apply the extension to the tab the user just clicked the toolbar icon on. |
| Optional host access | Three opt-in uses: adding a custom domain in the options page (that domain only), the auto-detect mode, and the "apply on every website" mode. The last two need broad access and release it when switched off. Nothing is granted at install time. |

## 6. Network requests

Normally there are none: the Vazirmatn font ships inside the extension.

In one fallback case — when a site's Content Security Policy blocks the packaged font — the font is fetched from the public **jsDelivr** CDN (`cdn.jsdelivr.net`). That request carries only the font file; no page or conversation content is included. As with any HTTP request, the CDN can see the IP address and user agent of the browser.

## 7. Sharing

No data is shared, sold or transferred to anyone, because no data is collected.

## 8. Ads and tracking

No advertising network, no analytics, no tracking pixels, no third-party code.

## 9. Children

The extension is not directed to children under 13 and collects no information from any age group.

## 10. Changes

If the extension's behaviour ever changes (for example a feature that requires a server), this page will be updated before that version is published, and the date at the top will change.

## 11. Contact

Privacy questions: `<SUPPORT_EMAIL>`
