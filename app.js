
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

  panel.style.display = "none";
  profile.classList.add("show");

  profileEmail.textContent = user.email || "E-posta bulunamadı";
  profileIcon.textContent = (user.email || "Q")
    .charAt(0)
    .toUpperCase();

  hesapDurumunuBildir(session);
}

function showLogin() {
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

  if (
    kod === "invalid_credentials" ||
    mesaj.toLowerCase().includes("invalid login credentials")
  ) {
    return "E-posta veya şifre hatalı.";
  }

  if (
    kod === "email_not_confirmed" ||
    mesaj.toLowerCase().includes("email not confirmed")
  ) {
    return "Önce e-posta adresini doğrulamalısın.";
  }

  if (
    kod === "user_already_exists" ||
    mesaj.toLowerCase().includes("already registered")
  ) {
    return "Bu e-posta adresiyle zaten bir hesap bulunuyor.";
  }

  if (
    mesaj.toLowerCase().includes("password should be")
  ) {
    return "Şifren en az 6 karakter olmalı.";
  }

  if (
    mesaj.toLowerCase().includes("rate limit")
  ) {
    return "Çok fazla deneme yapıldı. Bir süre sonra tekrar dene.";
  }

  return mesaj || "Bir hata oluştu. Lütfen tekrar dene.";
}

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
    } else {
      showLogin();
    }
  } catch (error) {
    console.error("QuiK oturum kontrol hatası:", error);
    showLogin();
  }
}

if (quikSupabase) {
  quikSupabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      showProfile(session.user, session);
    } else if (event === "SIGNED_OUT") {
      showLogin();
    }
  });

  checkSession();
} else {
  showMessage("Supabase bağlantısı kurulamadı. Ayarları kontrol et.", true);
}

setMode("signup");
