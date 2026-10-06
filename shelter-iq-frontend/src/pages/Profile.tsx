import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Save, X, Github, Mail, ShieldCheck, ShieldOff } from "lucide-react";
import ConfirmModal from "../components/common/ConfirmModal";
import ErrorBanner from "../components/common/ErrorBanner";
import Spinner from "../components/common/Spinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import * as userService from "../services/user";
import { normalizeError } from "../utils/errors";
import { initials, formatDate } from "../utils/format";

const PROVIDER_LABEL: Record<string, string> = {
  email: "Email & Password",
  google: "Google",
  github: "GitHub",
};

export default function Profile() {
  const { user, refreshUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!user) return null;

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await userService.updateMe({ name: name.trim() });
      await refreshUser();
      showToast("Profile updated", "success");
      setEditing(false);
    } catch (err) {
      setError(normalizeError(err, "Couldn't update your profile.").message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await userService.deleteMe();
      await logout();
      showToast("Your account has been deleted", "success");
      navigate("/", { replace: true });
    } catch (err) {
      showToast(normalizeError(err, "Couldn't delete your account.").message, "error");
    } finally {
      setDeleting(false);
      setConfirmDeleteOpen(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">Profile</h1>
      <p className="mt-1 text-sm text-ink-400">Manage your account details.</p>

      <div className="mt-8 card p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-primary-600 text-lg font-semibold text-white">
            {user.profile_picture ? (
              <img src={user.profile_picture} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(user.name, user.email)
            )}
          </span>
          <div>
            <p className="text-lg font-semibold text-ink-900">{user.name || "Unnamed user"}</p>
            <p className="text-sm text-ink-400">{user.email}</p>
          </div>
        </div>

        {error && (
          <div className="mt-6">
            <ErrorBanner message={error} />
          </div>
        )}

        <div className="mt-6 divide-y divide-primary-50 border-t border-primary-50">
          {editing ? (
            <form onSubmit={handleSave} className="space-y-4 py-5">
              <div>
                <label htmlFor="name" className="field-label">
                  Name
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="field-input"
                  placeholder="Your name"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? <Spinner /> : <Save className="h-4 w-4" />}
                  {saving ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setEditing(false);
                    setName(user.name ?? "");
                    setError(null);
                  }}
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Name</p>
                <p className="mt-1 text-sm text-ink-900">{user.name || "Not set"}</p>
              </div>
              <button onClick={() => setEditing(true)} className="btn-ghost">
                <Pencil className="h-4 w-4" /> Edit
              </button>
            </div>
          )}

          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-ink-400" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Email</p>
                <p className="mt-1 text-sm text-ink-900">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-3">
              <Github className="h-4 w-4 text-ink-400" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Authentication provider
                </p>
                <p className="mt-1 text-sm text-ink-900">
                  {PROVIDER_LABEL[user.provider] ?? user.provider}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-3">
              {user.is_verified ? (
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
              ) : (
                <ShieldOff className="h-4 w-4 text-ink-400" />
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Verification</p>
                <p className="mt-1 text-sm text-ink-900">
                  {user.is_verified ? "Verified" : "Not verified"}
                </p>
              </div>
            </div>
            <p className="text-xs text-ink-400">Member since {formatDate(user.created_at)}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50/50 p-6">
        <h2 className="text-sm font-semibold text-rose-700">Delete account</h2>
        <p className="mt-1 text-sm text-rose-600/90">
          Permanently deletes your account and all saved climate analyses. This can't be undone.
        </p>
        <button
          onClick={() => setConfirmDeleteOpen(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
        >
          Delete Account
        </button>
      </div>

      <ConfirmModal
        open={confirmDeleteOpen}
        title="Delete your account?"
        description="This permanently deletes your account and every climate analysis you've saved. This action can't be undone."
        confirmLabel="Delete Account"
        loading={deleting}
        onConfirm={handleDeleteAccount}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}
