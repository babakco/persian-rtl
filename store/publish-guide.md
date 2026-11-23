# Persian-RTL — راهنمای انتشار در Chrome Web Store

این فایل همهٔ چیزی است که برای ثبت آیتم در [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) لازم دارید: متن‌های آمادهٔ کپی، پاسخ‌های حریم خصوصی، توجیه مجوزها و ترتیب کارها.

---

## ۰) هویت‌ها: هر نام کجا می‌رود؟

| نام | کجا استفاده می‌شود | کجا **نمی‌شود** |
| --- | --- | --- |
| **Persian-RTL** | نام آیتم؛ از فیلد `name` در `manifest.json` خوانده می‌شود و همان چیزی است که کاربر در فروشگاه می‌بیند | — |
| **Abadis Dynamic Technology** | نام توسعه‌دهنده/ناشر در پنل: `Developer Dashboard → Settings → Developer name`. همان چیزی که زیر عنوان آیتم به‌صورت «Offered by …» دیده می‌شود | داخل manifest جایی برای نام شرکت نیست |
| **AD-Tech** | برند کوتاه در توضیحات، آیکون، فوتر صفحهٔ تنظیمات و متن سیاست حریم خصوصی | نام مستقل ناشر (فروشگاه فقط یک نام توسعه‌دهنده دارد) |
| **Mehdi Ravanbakhsh** | شخص تماس: ایمیل پشتیبانی، بند «مسئول داده» در سیاست حریم خصوصی، اعلامیهٔ Trader | نام آیتم |

> نام توسعه‌دهنده در پنل بعد از ثبت، باید تأیید شود (CWS برای نشان «تأییدشده» مالکیت دامنه یا ایمیل را بررسی می‌کند). بهتر است این کار با اکانت گوگل شرکتی و ایمیل روی دامنهٔ شرکت انجام شود.

---

## ۱) پیش‌نیازها (یک‌بار)

1. ورود به <https://chrome.google.com/webstore/devconsole> با اکانت گوگل شرکت.
2. پرداخت هزینهٔ یک‌بارهٔ **۵ دلار** ثبت‌نام توسعه‌دهنده.
3. فعال‌کردن **تأیید دومرحله‌ای (2FA)** روی همان اکانت (اجباری است).
4. در `Settings`:
   - **Developer name**: `Abadis Dynamic Technology`
   - **Contact email**: ایمیل رسمی شرکت (همان که در سیاست حریم خصوصی می‌آید)
5. یک **آدرس عمومی برای سیاست حریم خصوصی** آماده کنید (GitHub Pages، سایت شرکت، یا هر هاست ثابت). فایل آمادهٔ آن: `store/privacy-policy.html`.

---

## ۲) ساخت بستهٔ آپلود

```bash
cd /Users/babak/OpenCode/RTL-Extention-Chrome
npm run check && npm test          # باید ۳۰ تست پاس شود
npm run sync          # matches و host_permissions را با src/sites.js هم‌خوان می‌کند
zip -r -X Persian-RTL-v1.2.0.zip manifest.json src assets icons
```

- `manifest.json` باید در **ریشهٔ** زیپ باشد (نه داخل یک پوشه).
- `tests/`، `node_modules/`، `package.json` و `store/` را داخل زیپ نگذارید (خودشان در CWS معنا ندارند و فقط حجم و سطح بازبینی را بالا می‌برند).
- با هر آپدیت، `version` در manifest را بالا ببرید (مثلاً `1.0.1`). CWS نسخهٔ تکراری را رد می‌کند.

---

## ۳) آپلود آیتم

`Developer Dashboard → Items → New item` → فایل زیپ را رها کنید → `Upload`.

اگر خطای manifest گرفتید، متن خطا معمولاً دقیق است (مثلاً کلید ناشناخته یا الگوی نامعتبر). فایل فعلی از قبل اعتبارسنجی شده است.

---

## ۴) تب «Store listing» — متن‌های آماده

**Category:** `Tools` (جایگزین قابل قبول: `Productivity`)
**Language:** `Persian` — و در صورت تمایل با `Add language` نسخهٔ `English` را هم اضافه کنید.

### نام آیتم

```
Persian-RTL
```

### خلاصه (Summary — حداکثر ۱۳۲ کاراکتر)

```
راست‌چین (RTL) خودکار + فونت وزیرمتن برای ChatGPT، Gemini، Claude و Muse. یک کلیک روشن، یک کلیک خاموش.
```

### توضیحات کامل (فارسی)

```
Persian-RTL صفحه‌های چت هوش مصنوعی را برای فارسی‌زبان‌ها خوانا می‌کند.

■ راست‌چین هوشمند
هر پاراگراف، تیتر، آیتم فهرست یا سلول جدول که حتی یک حرف فارسی داشته باشد، کامل راست‌به‌چپ نمایش داده می‌شود؛ چه جمله با فارسی شروع شده باشد، چه با انگلیسی. لازم نیست دستی چیزی را انتخاب کنید.

■ فونت وزیرمتن
کل رابط چت با فونت وزیرمتن بازنویسی می‌شود — از جمله کادر تایپ پیام. بلوک‌های کد، فرمول‌های ریاضی و آیکون‌ها دست‌نخورده می‌مانند تا چیزی خراب نشود.

■ یک کلیک روشن، یک کلیک خاموش
روی آیکون افزونه در نوار ابزار کلیک کنید (یا Alt+Shift+R). نشان سبز ON یعنی فعال است. تغییر بلافاصله روی همهٔ تب‌های باز اعمال می‌شود و بعد از بستن مرورگر هم یادش می‌ماند.

■ سایت‌های پشتیبانی‌شده
ChatGPT (chatgpt.com، chat.openai.com و chat.com)، Gemini، Claude، Microsoft Copilot، Meta AI، Muse، DeepSeek، Grok، Perplexity، Le Chat (Mistral)، Qwen Chat، Poe، You.com، Character.AI و Pi.

■ فهرست کاملاً قابل ویرایش
از صفحهٔ تنظیمات هر سایتی را می‌توانید حذف کنید (و بعداً برگردانید) و هر دامنهٔ تازه‌ای اضافه کنید؛ زیردامنه‌ها هم پوشش داده می‌شوند.

■ دو حالت اختیاری برای پوشش بیشتر
«پوشش خودکار سایت‌های AI» هر دامنهٔ شبیه سرویس‌های هوش مصنوعی را بدون افزودن دستی پوشش می‌دهد. «اعمال روی همهٔ سایت‌ها» افزونه را روی هر صفحه‌ای فعال می‌کند — برای خواندن متن فارسی در هر سایتی. هر دو پیش‌فرض خاموش‌اند و با یک سوئیچ روشن می‌شوند.

■ حریم خصوصی
بدون حساب کاربری، بدون ثبت‌نام، بدون تبلیغ، بدون ردیابی. هیچ متنی از گفت‌وگوها از مرورگر شما خارج نمی‌شود؛ تنها چیزی که ذخیره می‌شود وضعیت روشن/خاموش است.

ساختهٔ AD-Tech — Abadis Dynamic Technology
پشتیبانی: <ایمیل پشتیبانی>
```

### توضیحات کامل (English، برای زبان دوم)

```
Persian-RTL makes AI chat interfaces readable for Persian and Arabic speakers.

• Smart RTL: any paragraph, heading, list item or table cell that contains at least one Persian letter is rendered fully right-to-left — even when the sentence starts with English text.
• Vazirmatn typeface across the chat UI. Code blocks, math and icon fonts are left untouched.
• One-click on/off from the toolbar (or Alt+Shift+R), with an ON/OFF badge. The state is remembered and applied to every open tab.
• Works out of the box on ChatGPT, Gemini, Claude, Microsoft Copilot, Meta AI, Muse, DeepSeek, Grok, Perplexity, Le Chat, Qwen Chat, Poe, You.com, Character.AI and Pi.
• The site list is fully editable: remove any site (and restore it later) or add your own domain.
• Two optional broad modes, both off by default: auto-detect covers any domain that looks like an AI service, and "apply on every website" runs the extension on every page you open.
• No account, no tracking, no ads. Nothing you type or read leaves your browser; only the on/off flag is stored locally.

Built by AD-Tech — Abadis Dynamic Technology.
```

> در توضیحات از کلمات کلیدی انبوه و نام برندهای دیگر به‌شکل گمراه‌کننده استفاده نکنید؛ بازبین‌ها به تطابق توضیحات با عملکرد واقعی حساس‌اند.

### گرافیک‌ها

| مورد | فایل | وضعیت |
| --- | --- | --- |
| Store icon ۱۲۸×۱۲۸ | `icons/icon128.png` | آماده |
| Screenshot ۱ — نمایش راست‌چین در چت | `store/screenshots/01-chat-1280x800.png` | آماده (۱۲۸۰×۸۰۰) |
| Screenshot ۲ — صفحهٔ تنظیمات | `store/screenshots/02-options-1280x800.png` | آماده (۱۲۸۰×۸۰۰) |
| Small promo tile ۴۴۰×۲۸۰ | `store/screenshots/promo-440x280.png` | آماده |
| Marquee ۱۴۰۰×۵۶۰ | — | فقط برای «Featured» لازم است، اختیاری |

تا ۵ اسکرین‌شات مجاز است؛ همین دو کافی است.

---

## ۵) تب «Privacy practices»

### Single purpose (جملهٔ واحد)

```
Make Persian and Arabic chat text readable inside AI chat web apps: right-to-left paragraph layout plus the Vazirmatn typeface.
```

### توجیه مجوزها (به انگلیسی بنویسید — بازبین‌ها انگلیسی می‌خوانند)

| مجوز | متن پیشنهادی |
| --- | --- |
| `storage` | Keeps the on/off state and the user's site list (removed defaults, added domains, auto-detect flag) in chrome.storage.sync. No personal data is stored or transmitted. |
| `scripting` | Registers/removes the content script for domains the user adds or removes in the options page, registers the optional auto-detect mode, and applies the extension to the current tab when the user turns it on from a site that is not on the list. |
| `activeTab` | Used only at the moment the user clicks the toolbar icon, to apply the stylesheet to that one tab. No persistent access to unrelated sites. |
| Host permissions (18 well-known AI chat sites: chatgpt.com, chat.openai.com, chat.com, gemini.google.com, claude.ai, copilot.microsoft.com, meta.ai, muse.meta.com, muse.ai, deepseek.com, grok.com, perplexity.ai, chat.mistral.ai, chat.qwen.ai, poe.com, you.com, character.ai, pi.ai) | The content script must run inside these chat pages to detect Persian letters and apply the font/RTL rules. Page text is read locally only, to decide paragraph direction, and is never transmitted. Users can switch any of these sites off from the options page. |
| `optional_host_permissions` (`*://*/*`) | Opt-in uses only, nothing is granted at install time: (a) adding a custom chat domain from the options page — requested for that one domain only; (b) the optional "auto-detect AI sites" mode, which applies to any domain that looks like an AI service; (c) the optional "apply on every website" mode, which the user can switch on when they want RTL text everywhere. Each one is triggered only by an explicit click, and the permission is released when both modes are switched off. |

**Remote code:** `No` — همهٔ جاوااسکریپت داخل بسته است. فونت وزیرمتن هم به‌صورت فایل همراه افزونه است؛ نسخهٔ CDN فقط وقتی استفاده می‌شود که CSP سایت اجازهٔ فونت داخلی افزونه را ندهد (یک فایل فونت، نه کد).

### Data usage

- **Does the extension collect user data?** `No` — هیچ داده‌ای به سرور فرستاده نمی‌شود؛ نه متن صفحه، نه تاریخ مرور، نه اطلاعات هویتی.
- تیک تأییدیه‌های CWS (فروش نرفتن داده، استفادهٔ نامرتبط نکردن، استفاده برای اعتبارسنجی نکردن) را بزنید — چون داده‌ای جمع نمی‌شود، این تأییدها بی‌خطر و درست‌اند.

### Privacy policy URL

آدرس عمومی `store/privacy-policy.html` را وارد کنید (پیش از Submit باید در دسترس باشد).

### Trader status (قانون DSA اتحادیهٔ اروپا)

اگر به‌عنوان کسب‌وکار منتشر می‌کنید، **trader** را انتخاب کنید:

- نام: `Abadis Dynamic Technology (AD-Tech)`
- شخص تماس: `Mehdi Ravanbakhsh`
- ایمیل و کشور/آدرس شرکت

اگر trader را اعلام نکنید، کاربران اروپایی هشدار «وضعیت تجاری اعلام نشده» می‌بینند.

---

## ۶) تب «Distribution»

- Visibility: `Public`
- Pricing: `Free`
- Regions: `All regions`
- در صورت تمایل، لینک صفحهٔ پشتیبانی/سایت شرکت را در تب Store listing وارد کنید.

---

## ۷) ارسال برای بازبینی

`Submit for review`. زمان بازبینی برای افزونه‌های تازه معمولاً از چند ساعت تا چند روز است. اگر رد شد، دلیل در همان پنل نوشته می‌شود؛ متن دقیق را بفرستید تا اصلاح کنیم.

**قبل از Submit، این‌ها را چک کنید:**

- [ ] `npm test` پاس می‌شود (۳۰ تست) و `npm run check` هم بدون خطاست.
- [ ] `version` در manifest از نسخهٔ قبلیِ منتشرشده بالاتر است.
- [ ] زیپ فقط شامل `manifest.json`، `src/`، `assets/`، `icons/` است.
- [ ] آدرس سیاست حریم خصوصی در دسترس است و همان متن فایل ما است.
- [ ] هر پنج پاسخ حریم خصوصی با رفتار واقعی کد می‌خواند (هیچ داده‌ای ارسال نمی‌شود).
- [ ] اسکرین‌شات‌ها همان چیزی را نشان می‌دهند که کاربر می‌بیند.

---

## ۸) بعد از انتشار

- **آپدیت:** `version` را بالا ببرید → زیپ جدید بسازید → در پنل `Package → Upload new package` → `Submit for review`.
- **تغییر نام آیتم** بعد از انتشار ممکن است ولی بازبینی جدید لازم دارد؛ حالا که انتخاب شده، از ابتدا `Persian-RTL` بماند بهتر است.
- **آمار:** نصب‌ها و حذف‌ها در بخش `Analytics` پنل.
- **نظرها:** پاسخ‌دادن به نظرات کاربران در رتبهٔ آیتم اثر دارد.
