# QuiK Account — ilk sürüm

Bu klasör, QuiK Account için kayıt/giriş arayüzü ve Supabase Auth bağlantı taslağını içerir.

## 1. Supabase projesi
1. Supabase hesabı aç ve yeni bir proje oluştur.
2. Project Settings → API bölümünden Project URL ve `anon` / publishable key değerini al.
3. `app.js` dosyasındaki `SUPABASE_URL` ve `SUPABASE_ANON_KEY` alanlarını doldur.
4. Authentication → URL Configuration bölümünde yerel geliştirme adresini ve yayın adresini Redirect URLs listesine ekle.
5. Authentication → Providers bölümünde Email sağlayıcısının açık olduğunu kontrol et.

## 2. Yerelde deneme
Bu klasörü bir yerel web sunucusuyla çalıştır. Örneğin VS Code Live Server kullanılabilir. `index.html` dosyasını doğrudan `file://` ile açmak yerine `http://localhost` üzerinden aç.

## 3. GitHub ve Vercel ile yayınlama
1. Bu dosyaları yeni bir GitHub deposuna yükle.
2. Vercel'de GitHub deposunu içe aktar ve deploy et.
3. Yayın adresini Supabase Authentication → URL Configuration bölümündeki Site URL ve Redirect URLs alanlarına ekle.

## Güvenlik notları
- Tarayıcıya yalnızca Supabase'in `anon` / publishable key değeri konur. `service_role` veya secret key asla `app.js` içine yazılmaz.
- Şifreleri kendi veritabanında saklama; Supabase Auth yönetir.
- Bu ilk sürüm yalnızca QuiK hesabı kayıt/giriş arayüzüdür. Henüz QuiK masaüstü uygulamasına bağlanmaz ve Google/Microsoft e-posta hesaplarını birleştirmez.
- Gerçek kullanıcıları davet etmeden önce e-posta doğrulamasını, parola politikalarını ve Supabase güvenlik ayarlarını test et.
