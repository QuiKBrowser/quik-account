
const SUPABASE_URL = "https://ujuyzjudqvbrjxttsxno.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_vTj5L8A_7LrVPo3f4oz0WA_T7RjWvrp";

/* HTML elemanları */

const form = document.querySelector("#auth-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const confirmInput = document.querySelector("#confirm-password");
const confirmWrap = document.querySelector("#confirm-wrap");
const message = document.querySelector("#message");
const submitButton = document.querySelector("#submit-button");
const title = document.querySelector("#form-title");
const subtitle = document.querySelector("#form-subtitle");
const signupTab = document.querySelector("#signup-tab");
const loginTab = document.querySelector("#login-tab");

const profile = document.querySelector("#profile");
const profileEmail = document.querySelector("#profile-email");
const logoutButton = document.querySelector("#logout-button");
const panel = document.querySelector(".panel");

let mode = "signup";
let quikSupabase = null;
let isProcessing = false;
let aktifKullanici = null;

const yearElement = document.querySelector("#year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

/* Supabase bağlantısı */

if (
  window.supabase &&
  SUPABASE_URL.startsWith("https://") &&
  SUPABASE_ANON_KEY.startsWith("sb_publishable_")
) {
  quikSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );
}

/* Genel mesaj */

function showMessage(text, isError = false) {
  if (!message) return;

  message.textContent = text;
  message.classList.toggle("error", isError);
}

/* QuiK masaüstü uygulamasına oturum bildirimi */

function hesapDurumunuBildir(session) {
  if (!window.quikAccount) return;

  if (session?.access_token && session?.refresh_token) {
    if (typeof window.quikAccount.oturumGonder === "function") {
      window.quikAccount.oturumGonder({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      });
    }
  } else {
    if (typeof window.quikAccount.cikisBildir === "function") {
      window.quikAccount.cikisBildir();
    }
  }
}

/* Profil ekranını aç */

function showProfile(user, session = null) {
  if (!user) return;

  aktifKullanici = user;

  if (panel) {
    panel.style.display = "none";
  }

  if (profile) {
    profile.classList.add("show");
  }

  if (profileEmail) {
    profileEmail.textContent = user.email || "E-posta bulunamadı";
  }

  if (session) {
    hesapDurumunuBildir(session);
  }

  hesapPaneliniGuncelle(user);
}

/* Giriş ekranını aç */

function showLogin() {
  aktifKullanici = null;

  if (panel) {
    panel.style.display = "";
  }

  if (profile) {
    profile.classList.remove("show");
  }

  hesapDurumunuBildir(null);
}

/* Kayıt / giriş sekmeleri */

function setMode(nextMode) {
  mode = nextMode === "login" ? "login" : "signup";

  const isSignup = mode === "signup";

  signupTab.classList.toggle("active", isSignup);
  loginTab.classList.toggle("active", !isSignup);

  confirmWrap.hidden = !isSignup;
  confirmInput.required = isSignup;

  passwordInput.autocomplete = isSignup
    ? "new-password"
    : "current-password";

  title.textContent = isSignup
    ? "QuiK hesabını oluştur"
    : "QuiK hesabına giriş yap";

  subtitle.textContent = isSignup
    ? "QuiK hizmetleri için ücretsiz hesabını oluştur."
    : "QuiK hesabına güvenli şekilde giriş yap.";

  submitButton.textContent = isSignup
    ? "QuiK hesabı oluştur"
    : "Giriş yap";

  showMessage("");
}

/* Hata mesajlarını Türkçeleştir */

function hataMesaji(error) {
  const kod = error?.code || "";
  const mesaj = error?.message || "";
  const altMesaj = mesaj.toLowerCase();

  if (
    kod === "invalid_credentials" ||
    altMesaj.includes("invalid login credentials")
  ) {
    return "E-posta veya şifre hatalı.";
  }

  if (
    kod === "email_not_confirmed" ||
    altMesaj.includes("email not confirmed")
  ) {
    return "Önce e-posta adresini doğrulamalısın.";
  }

  if (
    kod === "user_already_exists" ||
    altMesaj.includes("already registered")
  ) {
    return "Bu e-posta adresiyle zaten bir hesap bulunuyor.";
  }

  if (altMesaj.includes("password should be")) {
    return "Şifren en az 6 karakter olmalı.";
  }

  if (altMesaj.includes("rate limit")) {
    return "Çok fazla deneme yapıldı. Bir süre sonra tekrar dene.";
  }

  if (altMesaj.includes("network")) {
    return "İnternet bağlantısını kontrol edip tekrar dene.";
  }

  return mesaj || "Bir hata oluştu. Lütfen tekrar dene.";
}

/* Hesap yönetimi tasarımı */

function hesapStiliniEkle() {
  if (document.querySelector("#quik-account-style")) return;

  const style = document.createElement("style");
  style.id = "quik-account-style";

  style.textContent = `
    #quik-account-management {
      width: min(430px, 90vw);
      margin: 22px auto;
      padding: 20px;
      border: 1px solid #25345d;
      border-radius: 16px;
      background: #0a122b;
      color: #e8eeff;
      box-sizing: border-box;
      text-align: left;
    }

    #quik-account-management h2 {
      margin: 0 0 7px;
      font-size: 19px;
    }

    #quik-account-management .qa-muted {
      color: #8392bd;
      font-size: 12px;
      line-height: 1.5;
    }

    #quik-account-management .qa-menu {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      margin-top: 18px;
    }

    #quik-account-management .qa-menu-button {
      min-height: 42px;
      margin: 0;
      padding: 9px 7px;
      font-size: 12px;
      background: #111b3d;
      border: 1px solid #25345d;
    }

    #quik-account-management .qa-menu-button.active {
      background: #263d78;
      border-color: #668ce3;
      color: #ffffff;
    }

    #quik-account-management .qa-panel {
      display: none;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #25345d;
    }

    #quik-account-management .qa-panel.active {
      display: block;
    }

    #quik-account-management .qa-panel h3 {
      margin: 0 0 12px;
      font-size: 14px;
    }

    #quik-account-management input {
      display: block;
      width: 100%;
      height: 43px;
      margin: 8px 0;
      padding: 0 13px;
      border: 1px solid #25345d;
      border-radius: 10px;
      background: #050a18;
      color: #e8eeff;
      box-sizing: border-box;
      outline: none;
    }

    #quik-account-management input:focus {
      border-color: #5f87d8;
    }

    #quik-account-management button {
      width: 100%;
      min-height: 40px;
      margin-top: 8px;
      padding: 9px 12px;
      border: 1px solid #25345d;
      border-radius: 10px;
      background: #111b3d;
      color: #e8eeff;
      cursor: pointer;
    }

    #quik-account-management button:hover {
      background: #1a2750;
    }

    #quik-account-management button:disabled {
      opacity: .55;
      cursor: not-allowed;
    }

    #quik-account-management .qa-status {
      min-height: 18px;
      margin-top: 10px;
      color: #91b6ff;
      font-size: 12px;
      line-height: 1.5;
    }

    #quik-account-management .qa-provider {
      padding: 10px;
      margin: 7px 0;
      border-radius: 9px;
      background: #111b3d;
      font-size: 12px;
    }

    #quik-account-management .qa-google-consent {
      display: none;
      margin-top: 14px;
      padding: 15px;
      border: 1px solid #304779;
      border-radius: 13px;
      background: linear-gradient(145deg, #101d3c, #0a1228);
    }

    #quik-account-management .qa-google-consent.show {
      display: block;
    }

    #quik-account-management .qa-google-consent h4 {
      margin: 0 0 7px;
      color: #edf2ff;
      font-size: 14px;
    }

    #quik-account-management .qa-google-consent > p {
      color: #91a0c4;
      font-size: 12px;
      line-height: 1.55;
    }

    #quik-account-management .qa-google-permission {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      padding: 10px 0;
      border-top: 1px solid #25345d;
      color: #e8eeff;
      font-size: 12px;
      line-height: 1.5;
    }

    #quik-account-management .qa-google-permission span {
      display: block;
      color: #91a0c4;
      margin-top: 3px;
    }

    #quik-account-management .qa-google-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    #quik-account-management .qa-google-actions button {
      flex: 1;
      margin: 0;
    }

    #quik-account-management .qa-google-actions .qa-google-continue {
      background: #3158a4;
      border-color: #527bd0;
    }

    #quik-account-management .qa-google-note {
      margin: 10px 0 0;
      color: #8192b8;
      font-size: 11px;
      line-height: 1.5;
    }

    #quik-forgot-button {
      display: block;
      margin: 12px auto;
      padding: 5px 10px;
      border: 0;
      background: transparent;
      color: #8392bd;
      cursor: pointer;
      font-size: 12px;
    }

    #quik-forgot-button:hover {
      color: #e8eeff;
    }

    @media (max-width: 420px) {
      #quik-account-management {
        width: 94%;
        padding: 15px;
      }
    }
  `;

  document.head.appendChild(style);
}

/* Hesap yönetimi menüsünü oluştur */

function hesapElemaniOlustur() {
  hesapStiliniEkle();

  let container = document.querySelector("#quik-account-management");

  if (container) return container;

  container = document.createElement("div");
  container.id = "quik-account-management";

  container.innerHTML = `
    <h2>QuiK Hesabım</h2>

    <p class="qa-muted" id="qa-account-email"></p>

    <div class="qa-menu">
      <button type="button" class="qa-menu-button active" data-menu="overview">
        Hesap özeti
      </button>

      <button type="button" class="qa-menu-button" data-menu="password">
        Şifre işlemleri
      </button>

      <button type="button" class="qa-menu-button" data-menu="platforms">
        Bağlı platformlar
      </button>

      <button type="button" class="qa-menu-button" data-menu="security">
        Güvenlik
      </button>
    </div>

    <section class="qa-panel active" data-panel="overview">
      <h3>Hesap özeti</h3>
      <p class="qa-muted">QuiK hesabın başarıyla açık.</p>
      <p class="qa-muted">Hesabına ait e-posta adresi:</p>
      <div id="qa-overview-email" class="qa-provider"></div>
    </section>

    <section class="qa-panel" data-panel="password">
      <h3>Şifremi değiştir</h3>

      <form id="qa-password-form">
        <input id="qa-new-password" type="password" minlength="6"
          autocomplete="new-password" placeholder="Yeni şifre" required>

        <input id="qa-confirm-password" type="password" minlength="6"
          autocomplete="new-password" placeholder="Yeni şifreyi tekrar yaz" required>

        <button type="submit" id="qa-password-submit">
          Şifremi değiştir
        </button>
      </form>

      <div class="qa-status" id="qa-password-status"></div>
    </section>

    <section class="qa-panel" data-panel="platforms">
      <h3>Bağlı platform hesapları</h3>

      <button type="button" id="qa-google-link">
        Google hesabını bağla
      </button>

      <div class="qa-google-consent" id="qa-google-consent" aria-live="polite">
        <h4>QuiK Google izinleri</h4>
        <p>QuiK'in Google hizmetlerini kullanabilmesi için aşağıdaki erişimleri talep edeceğiz. Yalnızca devam edersen Google'ın kendi güvenli izin ekranına yönlendirilirsin.</p>

        <div class="qa-google-permission">
          <div>✉</div>
          <div><strong>Gmail</strong><span>E-postalarını görüntüleme ve senin isteğinle e-posta gönderme.</span></div>
        </div>
        <div class="qa-google-permission">
          <div>▣</div>
          <div><strong>Google Drive</strong><span>QuiK'in oluşturduğu veya QuiK üzerinden açtığın dosyalara erişme.</span></div>
        </div>
        <div class="qa-google-permission">
          <div>▶</div>
          <div><strong>YouTube</strong><span>Kanal bilgilerini görüntüleme ve senin başlattığın video yükleme işlemleri.</span></div>
        </div>
        <div class="qa-google-permission">
          <div>◉</div>
          <div><strong>Temel hesap bilgileri</strong><span>Google hesabının e-posta adresi ve profil bilgileri.</span></div>
        </div>

        <p class="qa-google-note">Bu ekran QuiK'in istediği izinleri açıklar. İzinleri gerçekten verme veya reddetme işlemi bir sonraki adımda Google'ın kendi ekranında yapılır. İstediğin zaman vazgeçebilirsin.</p>
        <div class="qa-google-actions">
          <button type="button" id="qa-google-cancel">Vazgeç</button>
          <button type="button" class="qa-google-continue" id="qa-google-continue">Google ile devam et</button>
        </div>
      </div>

      <div class="qa-status" id="qa-google-status"></div>
      <div id="qa-platform-list"></div>

      <p class="qa-muted">
        Burada QuiK hesabına bağlı harici platform hesapları görüntülenir.
      </p>
    </section>

    <section class="qa-panel" data-panel="security">
      <h3>Hesap güvenliği</h3>

      <p class="qa-muted">
        E-posta adresine şifre sıfırlama bağlantısı gönderebilirsin.
      </p>

      <button type="button" id="qa-reset-password">
        Şifre sıfırlama bağlantısı gönder
      </button>

      <div class="qa-status" id="qa-reset-status"></div>
    </section>
  `;

  profile.appendChild(container);

  /* Menü geçişleri */

  const menuButtons = container.querySelectorAll("[data-menu]");
  const menuPanels = container.querySelectorAll("[data-panel]");

  menuButtons.forEach((menuButton) => {
    menuButton.addEventListener("click", () => {
      const selectedMenu = menuButton.dataset.menu;

      menuButtons.forEach((button) => {
        button.classList.toggle("active", button === menuButton);
      });

      menuPanels.forEach((menuPanel) => {
        menuPanel.classList.toggle(
          "active",
          menuPanel.dataset.panel === selectedMenu
        );
      });
    });
  });

  /* Şifre değiştirme */

  const passwordForm = container.querySelector("#qa-password-form");

  passwordForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!quikSupabase || isProcessing) return;

    const newPassword =
      container.querySelector("#qa-new-password").value;

    const confirmPassword =
      container.querySelector("#qa-confirm-password").value;

    const status =
      container.querySelector("#qa-password-status");

    const button =
      container.querySelector("#qa-password-submit");

    if (newPassword.length < 6) {
      status.textContent = "Şifre en az 6 karakter olmalı.";
      return;
    }

    if (newPassword !== confirmPassword) {
      status.textContent = "Şifreler eşleşmiyor.";
      return;
    }

    isProcessing = true;
    button.disabled = true;
    button.textContent = "Güncelleniyor...";
    status.textContent = "";

    try {
      const { data, error } = await quikSupabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      if (data.user) {
        aktifKullanici = data.user;
      }

      passwordForm.reset();
      status.textContent = "Şifren başarıyla güncellendi.";
    } catch (error) {
      console.error("QuiK şifre değiştirme hatası:", error);
      status.textContent = hataMesaji(error);
    } finally {
      isProcessing = false;
      button.disabled = false;
      button.textContent = "Şifremi değiştir";
    }
  });

  /* Google hesabını bağla */

  const googleButton = container.querySelector("#qa-google-link");

  const googleConsent = container.querySelector("#qa-google-consent");
  const googleContinue = container.querySelector("#qa-google-continue");
  const googleCancel = container.querySelector("#qa-google-cancel");
  const googleStatus = container.querySelector("#qa-google-status");

  // İlk tıklama OAuth'u başlatmaz; önce QuiK'in istediği izinleri açıklar.
  googleButton.addEventListener("click", () => {
    if (googleHesabiBagliMi(aktifKullanici)) {
      googleStatus.textContent = "Google hesabın bu QuiK hesabına zaten bağlı.";
      return;
    }

    if (!window.quikAccount?.googleBagla) {
      googleStatus.textContent =
        "Google bağlantısı QuiK masaüstü uygulamasında kullanılabilir.";
      return;
    }

    googleConsent.classList.add("show");
    googleButton.textContent = "İzinler inceleniyor";
    googleStatus.textContent = "Devam etmeden önce QuiK'in istediği erişimleri incele.";
  });

  googleCancel.addEventListener("click", () => {
    googleConsent.classList.remove("show");
    googleButton.textContent = "Google hesabını bağla";
    googleStatus.textContent = "Google bağlantısı başlatılmadı.";
  });

  googleContinue.addEventListener("click", async () => {
    if (!quikSupabase || isProcessing) return;

    isProcessing = true;
    googleContinue.disabled = true;
    googleContinue.textContent = "Hazırlanıyor...";
    googleStatus.textContent = "";

    try {
      const { data, error } = await quikSupabase.auth.getSession();

      if (error) throw error;

      const accessToken = data.session?.access_token;

      if (!accessToken) {
        throw new Error("Önce QuiK hesabına giriş yapmalısın.");
      }

      // Son onay ve gerçek yetkilendirme Google'ın OAuth ekranında yapılır.
      window.quikAccount.googleBagla(accessToken);

      isProcessing = false;
      googleContinue.textContent = "Google'a yönlendiriliyor...";
      googleStatus.textContent =
        "Google'ın güvenli izin ekranı açılıyor. İzinleri orada onaylayabilir veya reddedebilirsin.";
    } catch (error) {
      console.error("Google bağlama başlatma hatası:", error);
      googleStatus.textContent = hataMesaji(error);
      googleContinue.disabled = false;
      googleContinue.textContent = "Google ile devam et";
      isProcessing = false;
    }
  });

  /* E-posta ile şifre sıfırlama */

  container
    .querySelector("#qa-reset-password")
    .addEventListener("click", async () => {
      if (!quikSupabase || !aktifKullanici?.email || isProcessing) return;

      const status = container.querySelector("#qa-reset-status");

      isProcessing = true;
      status.textContent = "Bağlantı gönderiliyor...";

      try {
        const { error } =
          await quikSupabase.auth.resetPasswordForEmail(
            aktifKullanici.email,
            {
              redirectTo: window.location.origin
            }
          );

        if (error) throw error;

        status.textContent =
          "Şifre sıfırlama bağlantısı e-posta adresine gönderildi.";
      } catch (error) {
        console.error("Şifre sıfırlama hatası:", error);
        status.textContent = hataMesaji(error);
      } finally {
        isProcessing = false;
      }
    });

  return container;
}

/* Google bağlantı durumunu hem identities hem providers bilgisinden kontrol et */

function googleHesabiBagliMi(user) {
  if (!user) return false;

  const identities = Array.isArray(user.identities)
    ? user.identities
    : [];

  const identityBagli = identities.some(
    (identity) => identity?.provider === "google"
  );

  const providers = Array.isArray(user.app_metadata?.providers)
    ? user.app_metadata.providers
    : [];

  return identityBagli ||
    providers.includes("google") ||
    user.app_metadata?.provider === "google";
}

/* Hesap bilgilerini güncelle */

function hesapPaneliniGuncelle(user) {
  const container = hesapElemaniOlustur();

  const email = user.email || "E-posta bulunamadı";

  container.querySelector("#qa-account-email").textContent = email;
  container.querySelector("#qa-overview-email").textContent = email;

  const platformList = container.querySelector("#qa-platform-list");
  platformList.replaceChildren();

  const identities = Array.isArray(user.identities)
    ? user.identities
    : [];

  const googleButton = container.querySelector("#qa-google-link");
  const googleStatus = container.querySelector("#qa-google-status");
  const googleBagli = googleHesabiBagliMi(user);

  if (googleButton) {
    googleButton.disabled = googleBagli;
    googleButton.textContent = googleBagli
      ? "Google hesabı bağlı"
      : "Google hesabını bağla";
  }

  if (googleStatus) {
    googleStatus.textContent = googleBagli
      ? "Google hesabın bu QuiK hesabına bağlı."
      : "";
  }

  if (identities.length === 0) {
    const bilgi = document.createElement("p");
    bilgi.className = "qa-muted";
    bilgi.textContent =
      "Şu anda bağlı harici platform hesabı bulunmuyor.";

    platformList.appendChild(bilgi);
    return;
  }

  identities.forEach((identity) => {
    const provider = document.createElement("div");
    provider.className = "qa-provider";

    const providerName = identity.provider || "Bilinmeyen platform";

    provider.textContent =
      providerName.charAt(0).toUpperCase() +
      providerName.slice(1);

    platformList.appendChild(provider);
  });
}

/* Google bağlantısı tamamlanınca oturumu yenile */

async function googleBaglantisiniYenile(oturum) {
  if (!quikSupabase) return;

  try {
    let user;
    let session;

    if (
      oturum &&
      typeof oturum.access_token === "string" &&
      typeof oturum.refresh_token === "string"
    ) {
      const { data, error } = await quikSupabase.auth.setSession({
        access_token: oturum.access_token,
        refresh_token: oturum.refresh_token
      });

      if (error) throw error;

      user = data.user;
      session = data.session;
    } else {
      const { data, error } = await quikSupabase.auth.getUser();

      if (error) throw error;

      user = data.user;

      const sessionResult = await quikSupabase.auth.getSession();

      if (sessionResult.error) throw sessionResult.error;

      session = sessionResult.data.session;
    }

    if (user) {
      aktifKullanici = user;

      showProfile(user, session);
      hesapPaneliniGuncelle(user);

      const status = document.querySelector("#qa-google-status");

      if (status) {
        status.textContent = "Google hesabı başarıyla bağlandı.";
      }

      // Butonun metnini burada elle sıfırlama.
      // Güncel kullanıcı verisine göre hesapPaneliniGuncelle belirlesin.
    }
  } catch (error) {
    console.error("Google bağlantısı yenileme hatası:", error);

    const status = document.querySelector("#qa-google-status");

    if (status) {
      status.textContent =
        "Bağlantı tamamlandı ancak hesap bilgileri yenilenemedi. Sayfayı yenileyip tekrar kontrol et.";
    }

    const button = document.querySelector("#qa-google-link");

    if (button) {
      button.disabled = false;
      button.textContent = "Google hesabını bağla";
    }
  } finally {
    isProcessing = false;
  }
}

/* Giriş ekranına şifremi unuttum seçeneği */

function sifremiUnuttumButonuEkle() {
  if (document.querySelector("#quik-forgot-button")) return;

  const button = document.createElement("button");

  button.type = "button";
  button.id = "quik-forgot-button";
  button.textContent = "Şifremi unuttum";

  form.insertAdjacentElement("afterend", button);

  button.addEventListener("click", async () => {
    if (!quikSupabase || isProcessing) return;

    const email = emailInput.value.trim().toLowerCase();

    if (!email) {
      showMessage("Önce e-posta adresini yaz.", true);
      emailInput.focus();
      return;
    }

    isProcessing = true;
    button.disabled = true;

    try {
      const { error } =
        await quikSupabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: window.location.origin
          }
        );

      if (error) throw error;

      showMessage(
        "Şifre sıfırlama bağlantısı e-posta adresine gönderildi."
      );
    } catch (error) {
      console.error("Şifremi unuttum hatası:", error);
      showMessage(hataMesaji(error), true);
    } finally {
      isProcessing = false;
      button.disabled = false;
    }
  });
}

/* Şifre sıfırlama bağlantısından gelen kullanıcı */

function sifreKurtarmaFormuGoster() {
  const container = hesapElemaniOlustur();

  if (container.querySelector("#qa-recovery-form")) return;

  const section = document.createElement("div");

  section.className = "qa-section";

  section.innerHTML = `
    <h3>Yeni şifreni belirle</h3>

    <form id="qa-recovery-form">
      <input id="qa-recovery-password" type="password" minlength="6"
        autocomplete="new-password" placeholder="Yeni şifre" required>

      <input id="qa-recovery-confirm" type="password" minlength="6"
        autocomplete="new-password" placeholder="Yeni şifreyi tekrar yaz" required>

      <button type="submit" id="qa-recovery-submit">
        Yeni şifreyi kaydet
      </button>
    </form>

    <div class="qa-status" id="qa-recovery-status"></div>
  `;

  const passwordPanel =
    container.querySelector('[data-panel="password"]');

  passwordPanel.appendChild(section);

  container.querySelector('[data-menu="password"]').click();

  section
    .querySelector("#qa-recovery-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!quikSupabase || isProcessing) return;

      const password =
        section.querySelector("#qa-recovery-password").value;

      const confirm =
        section.querySelector("#qa-recovery-confirm").value;

      const status =
        section.querySelector("#qa-recovery-status");

      const button =
        section.querySelector("#qa-recovery-submit");

      if (password.length < 6) {
        status.textContent = "Şifre en az 6 karakter olmalı.";
        return;
      }

      if (password !== confirm) {
        status.textContent = "Şifreler eşleşmiyor.";
        return;
      }

      isProcessing = true;
      button.disabled = true;
      button.textContent = "Kaydediliyor...";

      try {
        const { data, error } = await quikSupabase.auth.updateUser({
          password
        });

        if (error) throw error;

        if (data.user) {
          aktifKullanici = data.user;
        }

        section.remove();
        showMessage("Şifren başarıyla değiştirildi.");
      } catch (error) {
        console.error("Şifre kurtarma hatası:", error);
        status.textContent = hataMesaji(error);
      } finally {
        isProcessing = false;

        if (button.isConnected) {
          button.disabled = false;
          button.textContent = "Yeni şifreyi kaydet";
        }
      }
    });
}

/* Kayıt sekmesi */

signupTab.addEventListener("click", () => {
  if (!isProcessing) {
    setMode("signup");
  }
});

/* Giriş sekmesi */

loginTab.addEventListener("click", () => {
  if (!isProcessing) {
    setMode("login");
  }
});

/* Kayıt ve giriş işlemleri */

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (isProcessing) return;

  showMessage("");

  if (!quikSupabase) {
    showMessage(
      "Supabase bağlantısı kurulamadı. Ayarları kontrol et.",
      true
    );
    return;
  }

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  if (!email || !password) {
    showMessage("E-posta ve şifre alanlarını doldur.", true);
    return;
  }

  if (mode === "signup") {
    if (password !== confirmInput.value) {
      showMessage("Şifreler eşleşmiyor.", true);
      return;
    }

    if (password.length < 6) {
      showMessage("Şifren en az 6 karakter olmalı.", true);
      return;
    }
  }

  isProcessing = true;
  submitButton.disabled = true;
  submitButton.textContent = "İşlem yapılıyor...";

  try {
    if (mode === "signup") {
      const { data, error } = await quikSupabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      if (error) throw error;

      if (data.session && data.user) {
        showProfile(data.user, data.session);
        form.reset();
      } else {
        showMessage(
          "Kayıt başarılı! E-posta adresine gönderilen doğrulama bağlantısına tıklayıp ardından giriş yapabilirsin."
        );

        setMode("login");
        emailInput.value = email;
        passwordInput.value = "";
      }
    } else {
      const { data, error } =
        await quikSupabase.auth.signInWithPassword({
          email,
          password
        });

      if (error) throw error;

      if (!data.session || !data.user) {
        throw new Error("Giriş tamamlanamadı. Tekrar dene.");
      }

      showProfile(data.user, data.session);

      passwordInput.value = "";
      confirmInput.value = "";
      showMessage("");
    }
  } catch (error) {
    console.error("QuiK hesap işlemi hatası:", error);
    showMessage(hataMesaji(error), true);
  } finally {
    isProcessing = false;
    submitButton.disabled = false;

    submitButton.textContent = mode === "signup"
      ? "QuiK hesabı oluştur"
      : "Giriş yap";
  }
});

/* Güvenli çıkış */

logoutButton.addEventListener("click", async () => {
  if (!quikSupabase || isProcessing) return;

  isProcessing = true;
  logoutButton.disabled = true;

  try {
    const { error } = await quikSupabase.auth.signOut();

    if (error) throw error;

    showLogin();
    setMode("login");
    form.reset();

    showMessage("QuiK hesabından çıkış yapıldı.");
  } catch (error) {
    console.error("QuiK çıkış hatası:", error);
    alert("Çıkış yapılamadı: " + hataMesaji(error));
  } finally {
    isProcessing = false;
    logoutButton.disabled = false;
  }
});

/* Oturum kontrolü */

async function checkSession() {
  if (!quikSupabase) {
    showMessage("Supabase bağlantısı kurulamadı.", true);
    return;
  }

  try {
    const { data, error } =
      await quikSupabase.auth.getSession();

    if (error) throw error;

    if (data.session?.user) {
      // getSession içindeki kullanıcı nesnesi eski kalabilir.
      // Google bağlantı durumunu Supabase'ten güncel kullanıcıyla doğrula.
      const { data: userData, error: userError } =
        await quikSupabase.auth.getUser();

      if (userError) throw userError;

      showProfile(userData.user || data.session.user, data.session);
    } else {
      showLogin();
    }
  } catch (error) {
    console.error("QuiK oturum kontrol hatası:", error);
    showLogin();
  }
}

/* Ana süreç bildirimlerini dinle */

if (window.quikAccount?.onToast) {
  window.quikAccount.onToast((mesaj) => {
    const status = document.querySelector("#qa-google-status");

    if (status) {
      status.textContent = String(mesaj);
    } else {
      showMessage(String(mesaj));
    }

    console.log("QUIK ANA SÜREÇ BİLDİRİMİ:", mesaj);

    if (
      typeof mesaj === "string" &&
      (
        mesaj.includes("tamamlanamadı") ||
        mesaj.includes("başlatılamadı") ||
        mesaj.includes("süresi doldu")
      )
    ) {
      const button = document.querySelector("#qa-google-link");

      if (button) {
        const bagli = googleHesabiBagliMi(aktifKullanici);
        button.disabled = bagli;
        button.textContent = bagli
          ? "Google hesabı bağlı"
          : "Google hesabını bağla";
      }

      isProcessing = false;
    }
  });
}

/* Supabase oturum olayları ve Google dönüş bildirimi */

if (quikSupabase) {
  quikSupabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      showProfile(session.user, session);

      if (event === "PASSWORD_RECOVERY") {
        sifreKurtarmaFormuGoster();
      }
    } else if (event === "SIGNED_OUT") {
      showLogin();
    }
  });

  if (window.quikAccount?.onGoogleBaglandi) {
    window.quikAccount.onGoogleBaglandi((oturum) => {
      googleBaglantisiniYenile(oturum);
    });
  }

  sifremiUnuttumButonuEkle();
  checkSession();
} else {
  showMessage(
    "Supabase bağlantısı kurulamadı. Ayarları kontrol et.",
    true
  );
}

setMode("signup");
