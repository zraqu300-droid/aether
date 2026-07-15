# أثير الأثر: رحلة المبعوث (Aether of Impact)

لعبة جوال تعليمية سلمية تعتمد مبدأ "التعلم الضمني" — التعلّم بالفعل والأثر، لا بالوعظ المباشر.

## التقنيات

- React + Vite + TypeScript
- Tailwind CSS (RTL, خط Noto Kufi Arabic)
- Framer Motion (حركات وانتقالات)
- Lucide React (أيقونات)
- Ionic Capacitor (تغليف كتطبيق أندرويد)
- GitHub Actions (بناء APK تلقائياً)

## التشغيل المحلي

```bash
npm install
npm run dev
```

## بناء الويب

```bash
npm run build
```

## إعداد Capacitor لأندرويد

> الحزم مثبتة بالفعل في package.json. الخطوات التالية لتهيئة مشروع أندرويد محلياً:

```bash
# 1. بناء التطبيق
npm run build

# 2. إضافة منصة أندرويد
npx cap add android

# 3. مزامنة أصول الويب مع أندرويد
npx cap sync android

# 4. فتح المشروع في Android Studio
npx cap open android
```

### ملف الإعداد

ملف `capacitor.config.ts` مضبوط على:
- `appId`: `com.aether.impact`
- `appName`: `أثير الأثر`
- `webDir`: `dist`

### الاهتزاز (Haptics)

يستخدم التطبيق `@capacitor/haptics` للاهتزاز عند:
- لمس خلية في الخريطة (نبض خفيف)
- اختيار بديل في قرار (نبض متوسط)
- إقرار قرار (إشعار نجاح)
- انتهاء الرحلة (إشعار نجاح)

يعمل الاهتزاز فقط على الأجهزة المحمية (native)، ويتجاهل تلقائياً على المتصفح.

## GitHub Actions — بناء APK تلقائياً

ملف `.github/workflows/build-apk.yml` يعمل عند كل دفع إلى فرع `main`:

1. يثبّت Node.js 20 و JDK 17
2. يثبّت حزم npm ويبني تطبيق Vite
3. يزامن الأصول مع أندرويد (`npx cap sync android`)
4. يبني APK تجريبي (`./gradlew assembleDebug`)
5. يرفع الـ APK كـ Artifact قابل للتنزيل
6. ينشئ GitHub Release بـ APK مرفق

## بنية المشروع

```
src/
  game/
    GameContext.tsx    — إدارة حالة اللعبة (useReducer)
    scenarios.ts        — السيناريوهات والقرارات والبدائل
    haptics.ts          — واجهة الاهتزاز لـ Capacitor
  components/
    IntroScreen.tsx     — شاشة البداية
    StatsBar.tsx        — شريط الإحصائيات (الرسالة، المسؤولية، الانسجام، الطاقة)
    InsightCompass.tsx  — بوصلة البصيرة (SVG متوهج ودوار)
    BarrenMap.tsx       — خريطة الشبكة القابلة للإحياء
    DecisionCard.tsx    — بطاقة القرارات (3 بدائل + عدسة البصيرة + رؤية المستقبل)
    EchoesPanel.tsx     — قائمة نداءات الأصدقاء (الأصداء)
    EndingScreen.tsx    — شاشة النهاية والتقييم
  App.tsx               — الربط الرئيسي
```

## فلسفة اللعبة

- **أظهر ولا تُخبر**: اللاعب يكتشف الأثر بالتجربة لا بالوعظ
- **لا عنف**: تركيز على الإعمار والاستعادة والتعاطف
- **البدائل الثلاثة**: كل قرار له 3 خيارات بأثر مختلف
- **رؤية المستقبل**: عدسة البصيرة تُري الأثر بعد 10 سنين
- **البوصلة**: تتوهج وتدور بحسب جودة القرارات
