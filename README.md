# Persian-RTL

افزونهٔ Chrome (Manifest V3) که در **۱۸ سرویس AI مطرح** دو کار انجام می‌دهد:

1. **فونت** کل رابط چت را به **وزیرمتن** تغییر می‌دهد.
2. هر پاراگراف / تیتر / آیتم لیست / سلول جدول / جمله‌ای که **دست‌کم یک حرف فارسی** داشته باشد، **یک‌جا راست‌به‌چپ** نمایش داده می‌شود — حتی اگر با کلمهٔ انگلیسی شروع شده باشد.

با **یک کلیک** روی آیکون افزونه روشن می‌شود و با **یک کلیک** دیگر خاموش. لیست سایت‌ها هم کامل قابل ویرایش است: هر سایتی را می‌توانید حذف کنید یا سایت تازه اضافه کنید.

> **ناشر:** AD-Tech — Abadis Dynamic Technology · **شخص تماس:** Mehdi Ravanbakhsh
> **نام آیتم در فروشگاه:** `Persian-RTL` · **نسخه:** 1.2.0 · **مجوز:** MIT

---

## English

**Persian-RTL** is a Chrome (Manifest V3) extension that makes AI chat interfaces readable for Persian speakers.

- **Vazirmatn** typeface across the chat UI — code blocks, math and icon fonts stay untouched.
- **Smart RTL**: any paragraph, heading, list item or table cell that contains at least one Persian letter is rendered right-to-left, even when the sentence starts in English. Streaming answers are handled live.
- **One click** on the toolbar icon turns it on or off (`Alt`+`Shift`+`R`), with an ON/OFF badge.
- Ships a curated list of **18 well-known AI services** (ChatGPT, Gemini, Claude, Copilot, Meta AI, Muse, DeepSeek, Grok, Perplexity, Le Chat, Qwen, Poe, You.com, Character.AI, Pi). Remove any entry, add any domain, or switch on one of two optional modes: auto-detect AI-looking domains, or apply on **every** website.
- **No account, no tracking, no ads.** Nothing you type or read leaves the browser; only the extension's own settings are stored.

**Install (unpacked):** `chrome://extensions` → enable *Developer mode* → *Load unpacked* → pick this folder.
**Develop:** `npm install && npm test` (47 tests) · `npm run check` · `npm run sync`.

---

## نصب (حالت توسعه)

1. در Chrome به `chrome://extensions` بروید و **Developer mode** را روشن کنید.
2. **Load unpacked** را بزنید و پوشهٔ همین پروژه را انتخاب کنید (پوشه‌ای که `manifest.json` در ریشهٔ آن است).
3. آیکون افزونه را در نوار ابزار **Pin** کنید.

> بعد از هر تغییری در فایل‌ها، در `chrome://extensions` دکمهٔ ↻ را بزنید و صفحهٔ چت را یک‌بار بازخوانی کنید.

---

## استفاده

| کار | نتیجه |
| --- | --- |
| کلیک روی آیکون افزونه | روشن ↔ خاموش (فوری، در همهٔ تب‌های باز) |
| `Alt` + `Shift` + `R` | همان کار کلیک روی آیکون |
| نشان روی آیکون | **ON** سبز = فعال، **OFF** خاکستری = غیرفعال |
| کلیک راست روی آیکون → Options | مدیریت سایت‌ها، حالت خودکار، میان‌بر |

بعد از هر تغییرِ وضعیت، یک پیام کوتاه پایین-راست صفحه ظاهر می‌شود («روشن» / «خاموش»).

---

## سایت‌های پشتیبانی‌شده

سرویس‌های مطرحی که از ابتدا در فهرست هستند:

`ChatGPT` (chatgpt.com, chat.openai.com, chat.com) · `Gemini` · `Claude` · `Microsoft Copilot` · `Meta AI` · `Muse` (muse.meta.com, muse.ai) · `DeepSeek` · `Grok` · `Perplexity` · `Le Chat (Mistral)` · `Qwen Chat` · `Poe` · `You.com` · `Character.AI` · `Pi`

### حذف و اضافه

- **حذف:** در صفحهٔ تنظیمات، جلوی هر سایت دکمهٔ «حذف» را بزنید. سایت از فهرست خارج و دیگر روی آن اجرا نمی‌شود.
- **بازگردانی:** سایت‌های حذف‌شده در کارت «حذف‌شده از لیست پیش‌فرض» می‌مانند؛ یکی‌یکی یا با «بازگردانی همه» برمی‌گردند.
- **افزودن:** فقط دامنه را بنویسید (`chat.example.com` یا `localhost`) و «افزودن» را بزنید. مرورگر یک تأییدیهٔ کوتاه برای همان دامنه نشان می‌دهد و از آن به بعد مثل بقیهٔ سایت‌ها کار می‌کند (زیردامنه‌ها هم پوشش داده می‌شوند).

### دو حالت گسترده (اختیاری، پیش‌فرض خاموش)

| گزینه | چه می‌کند |
| --- | --- |
| **پوشش خودکار سایت‌های AI** | هر دامنه‌ای که شبیه سرویس AI باشد (`*.ai`، `gpt`، `llm`، `claude`، `perplexity`، …) بدون افزودن دستی پوشش داده می‌شود. |
| **اعمال روی همهٔ سایت‌ها** | افزونه روی هر صفحه‌ای فعال می‌شود، نه فقط سایت‌های AI. برای متن فارسی در هر سایتی (ایمیل، شبکهٔ اجتماعی، وبلاگ) مناسب است. |

هر دو برای فعال‌شدن یک اجازهٔ گستردهٔ مرورگر (`*://*/*`) می‌خواهند و فقط با کلیک شما داده می‌شوند. سایت‌هایی که در فهرست بالا حذف کرده باشید، حتی در حالت «همهٔ سایت‌ها» هم مستثنا می‌مانند.

---

## رفتار دقیق

**تشخیص فارسی:** وجود حتی یک حرف در بازهٔ فارسی/عربی (`U+0600–U+06FF`, `U+0750–U+077F`, `U+08A0–U+08FF`, `U+FB50–U+FDFF`, `U+FE70–U+FEFC`) به‌همراه ارقام فارسی `۰–۹` و ارقام عربی `٠–٩`.

**کدام عنصر RTL می‌شود؟**
- `<p>`, `<li>`, `<h1>`…`<h6>`, `<blockquote>`, `<td>`, `<th>`, `<dd>`, `<dt>`, `<figcaption>`, `<summary>` → کل عنصر.
- متنِ آزاد داخل `div`/`span` (ساختار Gemini) → نزدیک‌ترین بلوک والدِ همان متن.
- ورودی‌ها: `textarea`، `input` و کادرهای `contenteditable` (محل تایپ پیام) هم به‌محض فارسی‌شدن راست‌چین می‌شوند و با پاک‌شدن به حالت قبل برمی‌گردند.

**چه چیزی دست‌نخورده می‌ماند؟** بلوک‌های صرفاً انگلیسی، `pre`/`code` (کد نباید برعکس شود)، فرمول‌ها، `svg` و آیکون‌ها.

**فونت:** فایل متغیر `Vazirmatn-Variable.woff2` همراه افزونه است (بدون نیاز به اینترنت). اگر CSP سایت اجازهٔ فونت افزونه را ندهد، به‌صورت خودکار از CDN خوانده می‌شود. آیکون‌فونت‌ها (Material Symbols، FontAwesome، Codicons و…) و بلوک‌های کد از تغییر فونت مستثنا هستند.

**متن در حال تایپ:** خروجی استریم با `MutationObserver` دنبال می‌شود (debounce ۶۰ میلی‌ثانیه)؛ جمله‌ها همان‌طور که می‌آیند راست‌چین می‌شوند.

---

## ساختار پروژه

```
manifest.json                    ← MV3؛ matches و host_permissions از src/sites.js ساخته می‌شود
src/sites.js                     ← فهرست سایت‌ها (تنها منبع حقیقت) + توابع تطبیق دامنه
src/content.js                   ← انتخاب «اجرا/اجرا نکن» + تشخیص فارسی + اعمال RTL
src/content.css                  ← فونت وزیرمتن (فقط وقتی html.vz-on باشد) + استثناها
src/background.js                ← کلیک روی آیکون، نشان ON/OFF، ثبت داینامیک اسکریپت‌ها
src/options.html|css|js          ← مدیریت سایت‌ها، پوشش خودکار، میان‌بر
assets/vazirmatn/*.woff2         ← فونت وزیرمتن (متغیر، آفلاین)
icons/                           ← آیکون ۱۶ تا ۱۲۸ پیکسل
tools/sync-manifest.mjs          ← همگام‌سازی manifest با src/sites.js
tests/rtl.test.mjs               ← ۴۳ تست jsdom
store/                           ← بستهٔ انتشار در Chrome Web Store
```

**مدل داده** (در `chrome.storage.sync`، پس بین دستگاه‌ها هم می‌رود):

```js
{ enabled: true, disabledSites: ['*.poe.com'], customSites: ['chat.example.com'], autoDetect: false, allSites: false }
```

---

## توسعه و تست

```bash
npm install      # فقط jsdom (dev)
npm test         # ۴۷ تست: قوانین RTL، تصمیم‌گیری سایت‌ها، استریم، خاموش/روشن، Shadow DOM، بسته‌بندی
npm run check    # node --check روی همهٔ اسکریپت‌ها + اعتبارسنجی manifest
npm run sync     # بازسازی matches و host_permissions در manifest از روی src/sites.js
```

> اگر سایتی به فهرست پیش‌فرض اضافه/کم کردید، فقط `src/sites.js` را ویرایش کنید و `npm run sync` بزنید؛ تست بسته‌بندی هم بررسی می‌کند که manifest با لیست هم‌خوان باشد.

### ساخت بستهٔ آپلود برای Chrome Web Store

```bash
npm run check && npm test
zip -r -X Persian-RTL-v1.2.0.zip manifest.json src assets icons
```

`manifest.json` باید در ریشهٔ زیپ باشد. پوشه‌های `store/`، `tests/`، `tools/` و `node_modules/` را داخل زیپ نگذارید.

راهنمای کامل انتشار: [`store/publish-guide.md`](store/publish-guide.md)

---

## حریم خصوصی

هیچ داده‌ای جمع‌آوری یا ارسال نمی‌شود. تنها چیزی که ذخیره می‌شود، وضعیت روشن/خاموش و فهرست سایت‌هاست.
متن کامل: [`store/privacy-policy.md`](store/privacy-policy.md)

---

## محدودیت‌های شناخته‌شده

- محتوای داخل `iframe`ها و shadow rootهای **بسته** تغییر نمی‌کند.
- جهت راست‌چین در سطح **بلوک** اعمال می‌شود: اگر یک پاراگراف چند جمله داشته باشد، کل پاراگراف راست‌چین می‌شود (همان چیزی که خواسته شده)؛ جمله‌های جدا در پاراگراف/آیتم‌های جدا، هر کدام مستقل تصمیم می‌گیرند.
- اگر سایتی فونت را با `!important` روی عنصری قفل کرده باشد، ممکن است فونت آن عنصر تغییر نکند.
- سایتی که ظاهر متن را داخل Canvas رسم کند (به‌جای DOM) قابل تغییر نیست.
- حذف یک سایت از فهرست، اجازهٔ دسترسی مرورگر را پس نمی‌گیرد (این اجازه‌ها در سطح نصب اعلام شده‌اند)؛ فقط رفتار افزونه روی آن سایت خاموش می‌شود.

---

## مجوز

این پروژه زیر **MIT** منتشر می‌شود — فایل [LICENSE](LICENSE). استفادهٔ تجاری، تغییر و توزیع آزاد است؛ فقط متن مجوز و نام حق نشر باید بماند.

راهنمای مشارکت: [CONTRIBUTING.md](CONTRIBUTING.md) · تست‌ها با GitHub Actions روی هر push و PR اجرا می‌شوند.
