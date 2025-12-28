# Диагностика загрузки файлов

## Быстрая проверка

### 1. Проверка переменных окружения на сервере
Откройте: `https://ashot-zebelyan-site.vercel.app/api/test-upload`

Ожидается JSON вида:
```json
{
  "status": "ok",
  "env": {
    "hasSupabaseUrl": true,
    "hasServiceKey": true,
    "hasBucketName": true,
    "bucketName": "photos",
    ...
  }
}
```

Если `hasSupabaseUrl` или `hasServiceKey` = `false` → **проблема: переменные окружения не установлены в Vercel**

### 2. Проверка логов Vercel
1. Vercel Dashboard → ваш проект → **Logs**
2. Попробуйте загрузить фото
3. Ищите записи `=== UPLOAD START ===` и следующие логи

### 3. Проверка Supabase Storage
1. Supabase Dashboard → **Storage** → bucket `photos`
2. Проверьте:
   - ✅ Bucket существует
   - ✅ Bucket **публичный** (Public)
   - ✅ RLS политики разрешают чтение

### 4. Проверка переменных в Vercel
Vercel Dashboard → Settings → Environment Variables:

```
SUPABASE_URL=https://nsgmyqjjazratwlhqirv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_7owwsT9LD7m0J_RZQUv5Lg_UD3Z65Dy
SUPABASE_BUCKET_NAME=photos
```

**Важно:** После добавления переменных - передеплойте проект!

