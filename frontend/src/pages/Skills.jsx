import {
  Award,
  Eye,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  createSkill,
  deleteSkill,
  getSkills,
  updateSkill,
} from "../api/skills.js";

import {
  arrayData,
  getError,
  Button,
  Empty,
  ErrorBox,
  Field,
  inputClass,
  Modal,
  PageHeader,
  SearchBox,
  textareaClass,
} from "../components/employeeManagement/ManagementUI.jsx";


/* =========================================================
   CONSTANTS
   ========================================================= */

const emptySkill = {
  name: "",
  description: "",
};


/* =========================================================
   HELPERS
   ========================================================= */

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString();
}


/* =========================================================
   SKILLS PAGE
   ========================================================= */

export default function Skills() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  /* -------------------------------------------------------
     Skill create/edit
     ------------------------------------------------------- */

  const [modal, setModal] = useState(false);

  const [edit, setEdit] = useState(null);

  const [form, setForm] = useState(
    emptySkill
  );

  const [saving, setSaving] =
    useState(false);

  /* -------------------------------------------------------
     Delete
     ------------------------------------------------------- */

  const [deleting, setDeleting] =
    useState(null);


  /* =========================================================
     LOAD SKILLS
     ========================================================= */

  async function load(refresh = false) {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getSkills({
        search,
      });

      setItems(
        arrayData(
          response,
          ["skills"]
        )
      );
    } catch (loadError) {
      setError(
        getError(
          loadError,
          "Unable to load skills."
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }


  /* =========================================================
     SEARCH
     ========================================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);


  /* =========================================================
     STATISTICS
     ========================================================= */

  const statistics = useMemo(() => {
    const totalSkills =
      items.length;

    const totalAssignments =
      items.reduce(
        (total, skill) =>
          total +
          Number(
            skill?._count?.employees ||
              0
          ),
        0
      );

    return {
      totalSkills,
      totalAssignments,
    };
  }, [items]);


  /* =========================================================
     OPEN CREATE / EDIT
     ========================================================= */

  function openSkillModal(
    skill = null
  ) {
    setEdit(skill);

    if (skill) {
      setForm({
        name: skill.name || "",
        description:
          skill.description || "",
      });
    } else {
      setForm({
        ...emptySkill,
      });
    }

    setModal(true);
  }


  /* =========================================================
     CLOSE CREATE / EDIT
     ========================================================= */

  function closeSkillModal() {
    if (saving) {
      return;
    }

    setModal(false);
    setEdit(null);

    setForm({
      ...emptySkill,
    });
  }


  /* =========================================================
     SAVE SKILL
     ========================================================= */

  async function saveSkill(event) {
    event.preventDefault();

    const name =
      form.name.trim();

    if (!name) {
      setError(
        "Skill name is required."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name,
        description:
          form.description.trim() ||
          null,
      };

      if (edit) {
        await updateSkill(
          edit.id,
          payload
        );
      } else {
        await createSkill(
          payload
        );
      }

      setModal(false);
      setEdit(null);

      setForm({
        ...emptySkill,
      });

      await load(true);
    } catch (saveError) {
      setError(
        getError(
          saveError,
          "Unable to save skill."
        )
      );
    } finally {
      setSaving(false);
    }
  }


  /* =========================================================
     DELETE SKILL
     ========================================================= */

  function openDeleteDialog(skill) {
    setDeleting(skill);
  }


  function closeDeleteDialog() {
    if (saving) {
      return;
    }

    setDeleting(null);
  }


  async function confirmDelete() {
    if (!deleting?.id) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await deleteSkill(
        deleting.id
      );

      setDeleting(null);

      await load(true);
    } catch (deleteError) {
      setError(
        getError(
          deleteError,
          "Unable to delete skill."
        )
      );
    } finally {
      setSaving(false);
    }
  }


  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="p-4 sm:p-6">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <PageHeader
        icon={Award}
        title="Skills"
        description="Manage employee skills, expertise levels and assignments."
        onRefresh={() =>
          load(true)
        }
        refreshing={refreshing}
        action={
          <Button
            onClick={() =>
              openSkillModal()
            }
          >
            <Plus size={16} />
            Add skill
          </Button>
        }
      />


      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <div className="mt-4">
          <ErrorBox
            message={error}
          />
        </div>
      )}


      {/* =====================================================
          STATISTICS
          ===================================================== */}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">

        {/* Total skills */}
        <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--bms-text-muted)]">
                Total skills
              </p>

              <p className="mt-1 text-2xl font-semibold text-[var(--bms-text)]">
                {formatNumber(
                  statistics.totalSkills
                )}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Award size={18} />
            </div>
          </div>
        </div>


        {/* Assignments */}
        <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--bms-text-muted)]">
                Skill assignments
              </p>

              <p className="mt-1 text-2xl font-semibold text-[var(--bms-text)]">
                {formatNumber(
                  statistics.totalAssignments
                )}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Users size={18} />
            </div>
          </div>
        </div>

      </div>


      {/* =====================================================
          SEARCH
          ===================================================== */}

      <div className="mt-4 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search skills..."
        />
      </div>


      {/* =====================================================
          SKILL CARDS
          ===================================================== */}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

        {loading ? (
          <div className="col-span-full">
            <Empty
              text="Loading skills..."
            />
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-full rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">
            <Empty
              text="No skills found."
            />
          </div>
        ) : (
          items.map((skill) => {

            const employeeCount =
              Number(
                skill?._count?.employees ||
                  0
              );

            return (
              <div
                key={skill.id}
                className="flex flex-col overflow-hidden rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]"
              >

                {/* Card body */}
                <div className="p-4">

                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">

                    <div className="flex min-w-0 items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                        <Award size={18} />
                      </div>

                      <div className="min-w-0">

                        <h3 className="truncate font-semibold text-[var(--bms-text)]">
                          {skill.name}
                        </h3>

                        <p className="mt-0.5 text-[11px] text-[var(--bms-text-muted)]">
                          Employee skill
                        </p>

                      </div>

                    </div>


                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1">

                      <button
                        type="button"
                        onClick={() =>
                          openSkillModal(
                            skill
                          )
                        }
                        className="rounded-lg p-1.5 text-[var(--bms-text-muted)] transition hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)]"
                        title="Edit skill"
                      >
                        <Pencil
                          size={15}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openDeleteDialog(
                            skill
                          )
                        }
                        className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-500/10"
                        title="Delete skill"
                      >
                        <Trash2
                          size={15}
                        />
                      </button>

                    </div>

                  </div>


                  {/* Description */}
                  <p className="mt-4 min-h-[48px] text-sm leading-5 text-[var(--bms-text-secondary)]">
                    {skill.description ||
                      "No description available for this skill."}
                  </p>


                  {/* Assignment summary */}
                  <div className="mt-4 flex items-center justify-between rounded-lg bg-[var(--bms-surface-soft)] px-3 py-3">

                    <div className="flex items-center gap-2">

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                        <Users
                          size={15}
                        />
                      </div>

                      <div>
                        <p className="text-[10px] text-[var(--bms-text-muted)]">
                          Assigned employees
                        </p>

                        <p className="text-sm font-semibold text-[var(--bms-text)]">
                          {employeeCount}
                        </p>
                      </div>

                    </div>

                  </div>

                </div>


                {/* Footer */}
                <div className="mt-auto border-t border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-3">

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/skills/${skill.id}`
                      )
                    }
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface)] px-3 py-2 text-xs font-medium text-[var(--bms-text)] transition hover:border-blue-500/40 hover:text-blue-500"
                  >
                    <Eye size={14} />
                    View details
                  </button>

                </div>

              </div>
            );
          })
        )}

      </div>


      {/* =====================================================
          CREATE / EDIT SKILL
          ===================================================== */}

      <Modal
        open={modal}
        onClose={
          closeSkillModal
        }
        title={
          edit
            ? "Edit skill"
            : "Create skill"
        }
      >
        <form
          onSubmit={saveSkill}
          className="space-y-4 p-5"
        >

          <Field
            label="Skill name"
            required
          >
            <input
              className={inputClass}
              value={form.name}
              onChange={(event) =>
                setForm(
                  (current) => ({
                    ...current,
                    name:
                      event.target.value,
                  })
                )
              }
              required
              maxLength={100}
              placeholder="e.g. JavaScript"
            />
          </Field>


          <Field label="Description">
            <textarea
              className={
                textareaClass
              }
              value={
                form.description
              }
              onChange={(event) =>
                setForm(
                  (current) => ({
                    ...current,
                    description:
                      event.target.value,
                  })
                )
              }
              maxLength={1000}
              placeholder="Describe this skill..."
            />
          </Field>


          <div className="flex justify-end gap-2">

            <Button
              type="button"
              variant="secondary"
              onClick={
                closeSkillModal
              }
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : edit
                ? "Save changes"
                : "Create skill"}
            </Button>

          </div>

        </form>
      </Modal>


      {/* =====================================================
          DELETE CONFIRMATION
          ===================================================== */}

      <Modal
        open={!!deleting}
        onClose={
          closeDeleteDialog
        }
        title="Delete skill"
        width="max-w-md"
      >
        {deleting && (
          <div className="p-5">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <Trash2 size={22} />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-[var(--bms-text)]">
              Delete "{deleting.name}"?
            </h3>

            <p className="mt-2 text-sm leading-6 text-[var(--bms-text-secondary)]">
              This action will permanently
              remove this skill. The backend
              may prevent deletion if employees
              are currently assigned to it.
            </p>

            <div className="mt-5 flex justify-end gap-2">

              <Button
                type="button"
                variant="secondary"
                onClick={
                  closeDeleteDialog
                }
                disabled={saving}
              >
                Cancel
              </Button>

              <button
                type="button"
                onClick={
                  confirmDelete
                }
                disabled={saving}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={15} />

                {saving
                  ? "Deleting..."
                  : "Delete skill"}
              </button>

            </div>

          </div>
        )}
      </Modal>

    </div>
  );
}