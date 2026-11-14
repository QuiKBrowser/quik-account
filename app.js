
const SUPABASE_URL = "https://ujuyzjudqvbrjxttsxno.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_vTj5L8A_7LrVPo3f4oz0WA_T7RjWvrp";

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
const profileIcon = document.querySelector("#profile-icon");
const logoutButton = document.querySelector("#logout-button");
const panel = document.querySelector(".panel");

let mode = "signup";
let quikSupabase = null;
let isProcessing = false;
let aktifKullanici = null;

document.querySelector("#year").textContent = new Date().getFullYear();

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

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

function hesapDurumunuBildir(session) {
  if (!window.quikAccount) return;

  if (session?.access_token && session?.refresh_token) {
    window.quikAccount.oturumGonder({
      access_token: session.access_token,
      refresh_token: session.refresh_token
    });
  } else {
    window.quikAccount.cikisBildir();
  }
}

function showProfile(user, session = null) {
  if (!user) return;

  aktifKullanici = user;

  panel.style.display = "none";
  profile.classList.add("show");

  profileEmail.textContent = user.email || "E-posta bulunamadı";
  profileIcon.textContent = (user.email || "Q")
    .charAt(0)
    .toUpperCase();

  hesapDurumunuBildir(session);

  hesapPaneliniGuncelle(user);
}

function showLogin() {
  aktifKullanici = null;

  panel.style.display = "";
  profile.classList.remove("show");

  hesapDurumunuBildir(null);
}

function setMode(nextMode) {
  mode = nextMode;

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

/* Dinamik hesap yönetimi arayüzü */

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

    #quik-account-management .qa-section {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #25345d;
    }

    #quik-account-management .qa-section h3 {
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

    #quik-account-management .qa-hidden {
      display: none;
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
  `;

  document.head.appendChild(style);
}

function hesapElemaniOlustur() {
  hesapStiliniEkle();

  let container = document.querySelector("#quik-account-management");

  if (container) return container;

  container = document.createElement("div");
  container.id = "quik-account-management";

  container.innerHTML = `
    <h2>QuiK Hesabım</h2>
    <p class="qa-muted" id="qa-account-email"></p>

    <div class="qa-section">
      <h3>Şifre işlemleri</h3>

      <form id="qa-password-form">
        <input
          id="qa-new-password"
          type="password"
          minlength="6"
          autocomplete="new-password"
          placeholder="Yeni şifre"
          required
        >

        <input
          id="qa-confirm-password"
          type="password"
          minlength="6"
          autocomplete="new-password"
          placeholder="Yeni şifreyi tekrar yaz"
          required
        >

        <button type="submit" id="qa-password-submit">
          Şifremi değiştir
        </button>
      </form>

      <div class="qa-status" id="qa-password-status"></div>
    </div>

    <div class="qa-section">
      <h3>Bağlı platform hesapları</h3>
      <div id="qa-platform-list"></div>
      <p class="qa-muted">
        Burada hesabına bağlı kimlik sağlayıcıları görüntülenir.
        Yeni platform bağlantısı için ayrıca entegrasyon gerekir.
      </p>
    </div>

    <div class="qa-section">
      <h3>Hesap güvenliği</h3>
      <button type="button" id="qa-reset-password">
        E-posta ile şifre sıfırlama bağlantısı gönder
      </button>
      <div class="qa-status" id="qa-reset-status"></div>
    </div>
  `;

  profile.appendChild(container);

  const passwordForm = container.querySelector("#qa-password-form");

  passwordForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!quikSupabase || isProcessing) return;

    const newPassword = container.querySelector("#qa-new-password").value;
    const confirmPassword = container.querySelector("#qa-confirm-password").value;
    const status = container.querySelector("#qa-password-status");
    const button = container.querySelector("#qa-password-submit");

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

  container.querySelector("#qa-reset-password").addEventListener("click", async () => {
    if (!quikSupabase || !aktifKullanici?.email || isProcessing) return;

    const status = container.querySelector("#qa-reset-status");

    isProcessing = true;
    status.textContent = "Bağlantı gönderiliyor...";

    try {
      const { error } = await quikSupabase.auth.resetPasswordForEmail(
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

function hesapPaneliniGuncelle(user) {
  const container = hesapElemaniOlustur();

  container.querySelector("#qa-account-email").textContent =
    user.email || "E-posta bulunamadı";

  const platformList = container.querySelector("#qa-platform-list");
  platformList.replaceChildren();

  const identities = Array.isArray(user.identities)
    ? user.identities
    : [];

  if (identities.length === 0) {
    const bilgi = document.createElement("p");
    bilgi.className = "qa-muted";
    bilgi.textContent = "Şu anda bağlı harici platform hesabı bulunmuyor.";
    platformList.appendChild(bilgi);
    return;
  }

  identities.forEach((identity) => {
    const provider = document.createElement("div");
    provider.className = "qa-provider";

    const providerName = identity.provider || "Bilinmeyen platform";
    provider.textContent =
      providerName.charAt(0).toUpperCase() + providerName.slice(1);

    platformList.appendChild(provider);
  });
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
      const { error } = await quikSupabase.auth.resetPasswordForEmail(
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

  const section = document.createElement("div");
  section.className = "qa-section";

  section.innerHTML = `
    <h3>Yeni şifreni belirle</h3>

    <form id="qa-recovery-form">
      <input
        id="qa-recovery-password"
        type="password"
        minlength="6"
        autocomplete="new-password"
        placeholder="Yeni şifre"
        required
      >

      <input
        id="qa-recovery-confirm"
        type="password"
        minlength="6"
        autocomplete="new-password"
        placeholder="Yeni şifreyi tekrar yaz"
        required
      >

      <button type="submit">Yeni şifreyi kaydet</button>
    </form>

    <div class="qa-status" id="qa-recovery-status"></div>
  `;

  container.prepend(section);

  section.querySelector("#qa-recovery-form").addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      if (!quikSupabase || isProcessing) return;

      const password =
        section.querySelector("#qa-recovery-password").value;

      const confirm =
        section.querySelector("#qa-recovery-confirm").value;

      const status =
        section.querySelector("#qa-recovery-status");

      if (password.length < 6) {
        status.textContent = "Şifre en az 6 karakter olmalı.";
        return;
      }

      if (password !== confirm) {
        status.textContent = "Şifreler eşleşmiyor.";
        return;
      }

      isProcessing = true;

      try {
        const { error } = await quikSupabase.auth.updateUser({
          password
        });

        if (error) throw error;

        section.remove();
        status.textContent = "";

        showMessage("Şifren başarıyla değiştirildi.");
      } catch (error) {
        console.error("Şifre kurtarma hatası:", error);
        status.textContent = hataMesaji(error);
      } finally {
        isProcessing = false;
      }
    }
  );
}

/* Kayıt ve giriş */

signupTab.addEventListener("click", () => {
  if (!isProcessing) setMode("signup");
});

loginTab.addEventListener("click", () => {
  if (!isProcessing) setMode("login");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (isProcessing) return;

  showMessage("");

  if (!quikSupabase) {
    showMessage("Supabase bağlantısı kurulamadı. Ayarları kontrol et.", true);
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
    const { data, error } = await quikSupabase.auth.getSession();

    if (error) throw error;

    if (data.session?.user) {
      showProfile(data.session.user, data.session);

      if (data.session.user.recovery_sent_at) {
        sifreKurtarmaFormuGoster();
      }
    } else {
      showLogin();
    }
  } catch (error) {
    console.error("QuiK oturum kontrol hatası:", error);
    showLogin();
  }
}

/* Supabase oturum olayları */

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

  sifremiUnuttumButonuEkle();
  checkSession();
} else {
  showMessage("Supabase bağlantısı kurulamadı. Ayarları kontrol et.", true);
}

setMode("signup");
