
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

document.querySelector("#year").textContent = new Date().getFullYear();

if (
  window.supabase &&
  SUPABASE_URL.startsWith("https://") &&
  SUPABASE_ANON_KEY.startsWith("sb_publishable_")
) {
  quikSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

function showProfile(user, session = null) {
  panel.style.display = "none";
  profile.classList.add("show");

  profileEmail.textContent = user.email || "E-posta bulunamadı";
  profileIcon.textContent = (user.email || "Q").charAt(0).toUpperCase();

  if (session?.access_token && window.quikAccount) {
    window.quikAccount.oturumGonder(session.access_token);
  }
}

function showLogin() {
  panel.style.display = "";
  profile.classList.remove("show");

  if (window.quikAccount) {
    window.quikAccount.cikisBildir();
  }
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

signupTab.addEventListener("click", () => setMode("signup"));
loginTab.addEventListener("click", () => setMode("login"));

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showMessage("");

  if (!quikSupabase) {
    showMessage("Supabase ayarlarını kontrol et.", true);
    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (mode === "signup" && password !== confirmInput.value) {
    showMessage("Şifreler eşleşmiyor.", true);
    return;
  }

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

      if (data.session) {
        showProfile(data.user, data.session);
      } else {
        showMessage(
          "Kayıt başarılı! E-postanı doğruladıktan sonra giriş yapabilirsin."
        );
        form.reset();
      }
    } else {
      const { data, error } =
        await quikSupabase.auth.signInWithPassword({
          email,
          password
        });

      if (error) throw error;

      showProfile(data.user, data.session);
      passwordInput.value = "";
    }
  } catch (error) {
    showMessage(error.message || "Bir hata oluştu.", true);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = mode === "signup"
      ? "QuiK hesabı oluştur"
      : "Giriş yap";
  }
});

logoutButton.addEventListener("click", async () => {
  if (!quikSupabase) return;

  logoutButton.disabled = true;

  try {
    const { error } = await quikSupabase.auth.signOut();
    if (error) throw error;

    showLogin();
    setMode("login");
    form.reset();
  } catch (error) {
    alert("Çıkış yapılamadı: " + error.message);
  } finally {
    logoutButton.disabled = false;
  }
});

async function checkSession() {
  if (!quikSupabase) return;

  const { data, error } = await quikSupabase.auth.getSession();

  if (error) {
    console.error("Oturum kontrol hatası:", error);
    return;
  }

  if (data.session) {
    showProfile(data.session.user, data.session);
  }
}

if (quikSupabase) {
  quikSupabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      showProfile(session.user, session);
    } else if (event === "SIGNED_OUT") {
      showLogin();
    }
  });

  checkSession();
}
