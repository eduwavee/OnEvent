import { useState, type FormEvent } from "react";
import * as authApi from "../api/auth";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { IconShield, IconUsers } from "../components/icons";

export function ProfilePage() {
  const { user, setUser } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  if (!user) return null;

  async function handleSaveName(e: FormEvent) {
    e.preventDefault();
    setSavingName(true);
    try {
      const updated = await authApi.updateProfile(name);
      setUser(updated);
      toast.success("Nombre actualizado.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingName(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas nuevas no coinciden.");
      return;
    }
    setSavingPassword(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      toast.success("Contraseña actualizada.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="page">
      <h1>Mi perfil</h1>

      <div className="profile-grid">
        <form className="card profile-form" onSubmit={handleSaveName}>
          <h3 className="form-section-title">
            <IconUsers size={14} /> Datos personales
          </h3>
          <label>
            Nombre
            <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
          </label>
          <label>
            Email
            <input value={user.email} disabled />
          </label>
          <label>
            Rol
            <input value={`${user.role}${user.organization ? ` — ${user.organization.name}` : ""}`} disabled />
          </label>
          <button type="submit" className="btn btn-primary profile-form-submit" disabled={savingName}>
            {savingName ? "Guardando…" : "Guardar cambios"}
          </button>
        </form>

        <form className="card profile-form" onSubmit={handleChangePassword}>
          <h3 className="form-section-title">
            <IconShield size={14} /> Cambiar contraseña
          </h3>
          <label>
            Contraseña actual
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </label>
          <label>
            Contraseña nueva
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} required />
          </label>
          <label>
            Confirmar contraseña nueva
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
            />
          </label>
          <button type="submit" className="btn btn-primary profile-form-submit" disabled={savingPassword}>
            {savingPassword ? "Guardando…" : "Actualizar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
