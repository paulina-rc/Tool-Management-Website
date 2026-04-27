import { useState } from "react";
import { useNavigate } from "react-router";
import { Lock, User, GraduationCap, ShieldCheck, BookOpen, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAppStore } from "../store/AppStore";

type LoginMode = "admin" | "profesor";

const CREDENTIALS = {
  admin: { username: "admin", password: "admin123", displayName: "Administrador" },
  profesor: { password: "prof123" },
};

export function Login() {
  const navigate = useNavigate();
  const { login } = useAppStore();

  const [mode, setMode] = useState<LoginMode>("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const triggerError = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "admin") {
      if (
        username.trim() === CREDENTIALS.admin.username &&
        password === CREDENTIALS.admin.password
      ) {
        login("admin", CREDENTIALS.admin.displayName);
        navigate("/dashboard");
      } else {
        triggerError("Usuario o contraseña incorrectos.");
      }
    } else {
      if (!username.trim()) {
        triggerError("Ingrese su nombre de usuario.");
        return;
      }
      if (password === CREDENTIALS.profesor.password) {
        login("profesor", username.trim());
        navigate("/my-reservations");
      } else {
        triggerError("Contraseña incorrecta.");
      }
    }
  };

  const switchMode = (newMode: LoginMode) => {
    setMode(newMode);
    setUsername("");
    setPassword("");
    setError("");
  };

  return (
    <div className="min-h-screen flex bg-[#F9FAF7]">

      {/* PANEL IZQUIERDO */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#42511c] to-[#5c6934] flex-col justify-between p-12 relative overflow-hidden shadow-2xl">

        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full border-[60px] border-white" />
          <div className="absolute bottom-[-5%] left-[-5%] w-72 h-72 rounded-full border-[40px] border-white" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-[#6B8E23] rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="size-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Gestión de Herramientas</p>
              <p className="text-[#DDE5D3] text-xs">Colegio Agropecuario de San Carlos</p>
            </div>
          </div>

          <h2 className="text-white text-4xl leading-tight mb-4">
            Sistema de<br />Gestión de<br />Herramientas
          </h2>

          <p className="text-[#DDE5D3] text-sm max-w-xs">
            Administra herramientas, reservas y préstamos de forma eficiente.
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur border border-white/10">
            <ShieldCheck className="size-4 text-[#6B8E23]" />
            <p className="text-white text-xs">Administrador</p>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur border border-white/10">
            <BookOpen className="size-4 text-[#8FAE5D]" />
            <p className="text-white text-xs">Profesor</p>
          </div>
        </div>
      </div>

      {/* FORMULARIO */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-[#EEF2E6] p-8 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-[#DDE5D3]">

          <h2 className="text-[#1F2937] text-2xl mb-2 font-semibold text-center">Gestión de Herramientas</h2>
          <p className="text-[#6B7280] text-sm mb-8">Colegio Agropecuario de San Carlos</p>

          {/* SELECTOR */}
          <div className="flex gap-2 p-1 bg-[#DDE5D3] rounded-xl mb-7 shadow-inner">
            <button
              type="button"
              onClick={() => switchMode("admin")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                mode === "admin"
                  ? "bg-[#5c6934] text-white shadow-md scale-[1.03]"
                  : "text-[#6B7280]"
              }`}
            >
              Administrador
            </button>

            <button
              type="button"
              onClick={() => switchMode("profesor")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                mode === "profesor"
                  ? "bg-[#6B8E23] text-white shadow-md scale-[1.03]"
                  : "text-[#6B7280]"
              }`}
            >
              Profesor
            </button>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleLogin}
            className={`space-y-5 ${shake ? "animate-[shake_0.4s]" : ""}`}
          >

            <div>
              <input
                type="text"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-4 py-3 border border-[#bcc1b8] rounded-xl bg-white text-[#1F2937] shadow-sm focus:ring-2 focus:ring-[#8FAE5D]/40 focus:border-[#8FAE5D] transition-all"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-10 py-3 border border-[#bcc1b8] rounded-xl bg-white text-[#1F2937] shadow-sm focus:ring-2 focus:ring-[#8FAE5D]/40 focus:border-[#8FAE5D] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#42511c]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-3 shadow-sm">
                <AlertCircle className="size-4" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold bg-[#6B8E23] text-white shadow-[0_8px_20px_rgba(107,142,35,0.3)] hover:bg-[#5A7A1C] hover:shadow-[0_12px_30px_rgba(107,142,35,0.45)] hover:-translate-y-1 active:scale-[0.97] transition-all duration-300"
            >
              Iniciar Sesión
            </button>
          </form>

          {/* CREDENCIALES DE ACCESO */}
          <div className="mt-6 rounded-xl border border-[#c8d4b0] bg-white/60 p-4 space-y-3">
            <p className="text-xs font-semibold text-[#42511c] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" />
              Credenciales de acceso para revisión
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-[#42511c]/8 border border-[#c8d4b0] p-3">
                <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-1.5 font-medium">Administrador</p>
                <p className="text-xs text-[#1F2937]">
                  <span className="text-[#6B7280]">Usuario:</span>{" "}
                  <span className="font-mono font-semibold">admin</span>
                </p>
                <p className="text-xs text-[#1F2937] mt-0.5">
                  <span className="text-[#6B7280]">Clave:</span>{" "}
                  <span className="font-mono font-semibold">admin123</span>
                </p>
              </div>
              <div className="rounded-lg bg-[#6B8E23]/8 border border-[#c8d4b0] p-3">
                <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-1.5 font-medium">Profesor</p>
                <p className="text-xs text-[#1F2937]">
                  <span className="text-[#6B7280]">Usuario:</span>{" "}
                  <span className="font-mono font-semibold">cualquier nombre</span>
                </p>
                <p className="text-xs text-[#1F2937] mt-0.5">
                  <span className="text-[#6B7280]">Clave:</span>{" "}
                  <span className="font-mono font-semibold">prof123</span>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-3px); }
        }
      `}</style>
    </div>
  );
}