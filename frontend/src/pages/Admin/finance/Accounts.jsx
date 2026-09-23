import { useEffect, useState } from "react";
import { Landmark, Pencil, Plus, Wallet } from "lucide-react";
import {
  getAccounts,
  createAccount,
  updateAccount,
} from "../../../api/finance.js";
import {
  Badge,
  Button,
  Card,
  Empty,
  ErrorBox,
  Field,
  inputClass,
  Loading,
  Modal,
  Page,
  selectClass,
  toneForStatus,
  label,
  unwrap,
  fmtMoney,
} from "./FinanceUI.jsx";

const types = [
  "CASH",
  "BANK",
  "MOBILE_MONEY",
  "DIGITAL_WALLET",
  "OTHER",
];

const statuses = ["ACTIVE", "INACTIVE", "CLOSED"];

const blank = {
  name: "",
  accountNumber: "",
  type: "BANK",
  status: "ACTIVE",
  currency: "SLE",
  openingBalance: "0",
  description: "",
};

export default function Accounts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAccounts();
      setItems(unwrap(response));
    } catch (err) {
      setError(err?.message || "Unable to load accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const open = (account = null) => {
    setEdit(account);

    setForm(
      account
        ? {
            name: account.name || "",
            accountNumber: account.accountNumber || "",
            type: account.type || "BANK",
            status: account.status || "ACTIVE",
            currency: account.currency || "SLE",
            openingBalance: String(account.openingBalance ?? 0),
            description: account.description || "",
          }
        : { ...blank }
    );

    setModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModal(false);
    setEdit(null);
    setForm({ ...blank });
  };

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const save = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const body = {
        name: form.name.trim(),
        accountNumber: form.accountNumber.trim() || null,
        type: form.type,
        status: form.status,
        currency: form.currency.trim().toUpperCase(),
        description: form.description.trim() || null,
      };

      if (edit) {
        await updateAccount(edit.id, body);
      } else {
        await createAccount({
          ...body,
          openingBalance: Number(form.openingBalance || 0),
        });
      }

      closeModal();
      await load();
    } catch (err) {
      setError(err?.message || "Unable to save account.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page
      title="Financial Accounts"
      description="Manage company cash, bank and digital financial accounts."
      icon={Landmark}
      onRefresh={load}
    >
      {error && <ErrorBox message={error} />}

      <div className="mb-4 flex justify-end">
        <Button onClick={() => open()}>
          <Plus size={16} />
          New account
        </Button>
      </div>

      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <Card>
          <Empty text="No financial accounts found." />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((account) => (
            <Card
              key={account.id}
              className="p-5 transition hover:-translate-y-0.5 hover:border-blue-500/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <Wallet size={21} />
                </div>

                <Badge tone={toneForStatus(account.status)}>
                  {label(account.status)}
                </Badge>
              </div>

              <h3 className="mt-4 font-semibold">
                {account.name}
              </h3>

              <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                {label(account.type)}
                {account.accountNumber
                  ? ` · ${account.accountNumber}`
                  : ""}
              </p>

              <p className="mt-5 text-2xl font-bold">
                {fmtMoney(
                  account.currentBalance,
                  account.currency
                )}
              </p>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => open(account)}
                  className="rounded-lg p-2 text-[var(--bms-text-muted)] hover:bg-[var(--bms-surface-soft)]"
                  aria-label={`Edit ${account.name}`}
                  title="Edit account"
                >
                  <Pencil size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modal}
        onClose={closeModal}
        title={edit ? "Edit account" : "New financial account"}
      >
        <form onSubmit={save} className="space-y-4 p-5">
          <Field label="Account name" required>
            <input
              className={inputClass}
              required
              value={form.name}
              onChange={(event) =>
                updateField("name", event.target.value)
              }
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Account type" required>
              <select
                className={selectClass}
                required
                value={form.type}
                onChange={(event) =>
                  updateField("type", event.target.value)
                }
              >
                {types.map((type) => (
                  <option key={type} value={type}>
                    {label(type)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Status" required>
              <select
                className={selectClass}
                required
                value={form.status}
                onChange={(event) =>
                  updateField("status", event.target.value)
                }
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {label(status)}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Account number">
              <input
                className={inputClass}
                value={form.accountNumber}
                onChange={(event) =>
                  updateField("accountNumber", event.target.value)
                }
              />
            </Field>

            <Field label="Currency" required>
              <input
                className={inputClass}
                required
                maxLength={3}
                value={form.currency}
                onChange={(event) =>
                  updateField("currency", event.target.value)
                }
              />
            </Field>
          </div>

          {!edit && (
            <Field label="Opening balance">
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={form.openingBalance}
                onChange={(event) =>
                  updateField("openingBalance", event.target.value)
                }
              />
            </Field>
          )}

          <Field label="Description">
            <textarea
              className="min-h-24 w-full rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface)] p-3 text-sm"
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
            />
          </Field>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={closeModal}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : edit
                  ? "Save changes"
                  : "Create account"}
            </Button>
          </div>
        </form>
      </Modal>
    </Page>
  );
}
