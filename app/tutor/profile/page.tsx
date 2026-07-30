"use client";
import { useState, useEffect } from "react";
import {
  User,
  Briefcase,
  ClipboardList,
  LayoutDashboard,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Pencil,
  Upload,
  Save,
  X,
  Plus,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/app/src/components/layouts/dashboard-layouts";
import ProtectedPageWrapper from "@/app/src/components/layouts/protected-page-wrapper";
import { auth, db } from "@/app/firebase/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

const tutorNavItems = [
  { label: "Dashboard", href: "/tutor/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/tutor/profile", icon: User },
  { label: "Gigs", href: "/tutor/gigs", icon: Briefcase },
  { label: "My Gigs", href: "/tutor/my-gigs", icon: ClipboardList },
];

const categoryOptions = [
  { value: "academic", label: "Academic Subjects" },
  { value: "digital_skills", label: "Digital Skills" },
];

// NOTE: adjust these values to match whatever documentType strings your
// admin/verification screens already expect.
const documentTypeOptions = [
  { value: "cv", label: "CV / Resume" },
  { value: "degree_certificate", label: "Degree Certificate" },
  { value: "id_card", label: "Government ID" },
  { value: "other", label: "Other" },
];

const documentStatusConfig: Record<
  "pending" | "approved" | "rejected",
  { icon: React.ElementType; tone: "sage" | "ochre" | "terracotta"; label: string }
> = {
  pending: { icon: Clock, tone: "ochre", label: "Pending" },
  approved: { icon: CheckCircle, tone: "sage", label: "Approved" },
  rejected: { icon: XCircle, tone: "terracotta", label: "Rejected" },
};

const ALLOWED_UPLOAD_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

interface TutorData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  createdAt: any;
  tutorProfile: {
    status: string;
    bio: string;
    category: string;
    degreeClass: string;
    hourlyRate: number;
    specialization: string[];
  };
}

interface DocumentRecord {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  status: "pending" | "approved" | "rejected";
  uploadedAt: any;
}

interface PersonalDraft {
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
}

interface QualificationsDraft {
  bio: string;
  category: string;
  degreeClass: string;
  hourlyRate: number | "";
  specialization: string[];
}

function calculateProfileCompletion(tutor: TutorData): number {
  const fields = [
    tutor.firstName,
    tutor.lastName,
    tutor.email,
    tutor.phone,
    tutor.location,
    tutor.tutorProfile?.bio,
    tutor.tutorProfile?.degreeClass,
    tutor.tutorProfile?.hourlyRate,
    tutor.tutorProfile?.specialization?.length > 0,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

function formatStatusLabel(status: string): string {
  return status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusToTone(status: string): "sage" | "ochre" | "terracotta" {
  if (status === "active") return "sage";
  if (status === "rejected") return "terracotta";
  return "ochre"; // pending / pending_verification / default
}

/* ---------- Local primitives, matched to the Kopa360 landing page ---------- */
/* Mirrors the primitives defined in the tutor dashboard page. If this pattern
   shows up in a third place, it's worth lifting these into a shared file. */

function Pill({
  children,
  tone = "sand",
}: {
  children: React.ReactNode;
  tone?: "sand" | "sage" | "terracotta" | "ochre";
}) {
  const styles = {
    sand: "bg-sand text-ink border-line",
    sage: "bg-sage/10 text-sage border-sage/20",
    terracotta: "bg-terracotta/10 text-terracotta border-terracotta/25",
    ochre: "bg-ochre/10 text-ochre border-ochre/25",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.24em] text-ink-soft">
      <span className="h-px w-8 bg-line" />
      <span>{children}</span>
    </div>
  );
}

function ProgressRing({
  progress,
  size = 56,
}: {
  progress: number;
  size?: number;
}) {
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--sand)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--terracotta)"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-[stroke-dashoffset] duration-700 ease-out"
      />
    </svg>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-sand text-ink-soft">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-display text-lg text-ink">{title}</p>
        <p className="mt-1 max-w-xs text-sm text-ink-soft">{description}</p>
      </div>
    </div>
  );
}

/* Shared field styling so read-only vs editable states stay consistent */
const fieldLabelClass =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft";
const fieldBaseClass =
  "w-full rounded-xl border px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 transition focus:outline-none focus:ring-2 focus:ring-terracotta/25";
const fieldEditableClass = "border-line bg-white focus:border-terracotta/40";
const fieldReadOnlyClass = "border-transparent bg-sand/50 text-ink-soft";

function primaryButtonClass(disabled: boolean) {
  return cn(
    "inline-flex items-center gap-1.5 rounded-full bg-terracotta px-4 py-2 text-sm font-medium text-cream transition hover:opacity-90",
    disabled && "cursor-not-allowed opacity-60 hover:opacity-60",
  );
}

const ghostButtonClass =
  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition hover:text-ink";

/* ---------- Page ---------- */

export default function TutorProfile() {
  const [tutor, setTutor] = useState<TutorData | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Personal information editing
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [personalError, setPersonalError] = useState<string | null>(null);
  const [personalDraft, setPersonalDraft] = useState<PersonalDraft>({
    firstName: "",
    lastName: "",
    phone: "",
    location: "",
  });

  // Qualifications editing
  const [isEditingQualifications, setIsEditingQualifications] =
    useState(false);
  const [isSavingQualifications, setIsSavingQualifications] = useState(false);
  const [qualError, setQualError] = useState<string | null>(null);
  const [qualDraft, setQualDraft] = useState<QualificationsDraft>({
    bio: "",
    category: "",
    degreeClass: "",
    hourlyRate: "",
    specialization: [],
  });
  const [newSubject, setNewSubject] = useState("");

  // Document upload
  const [isUploadPanelOpen, setIsUploadPanelOpen] = useState(false);
  const [uploadDocType, setUploadDocType] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const uid = currentUser.uid;

        // Fetch tutor profile
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          setTutor(userDoc.data() as TutorData);
        }

        // Fetch documents
        const docsQuery = query(
          collection(db, "documents"),
          where("tutorId", "==", doc(db, "users", uid)),
        );
        const docsSnap = await getDocs(docsQuery);
        setDocuments(
          docsSnap.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as DocumentRecord,
          ),
        );
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const profileCompletion = tutor ? calculateProfileCompletion(tutor) : 0;
  const status = tutor?.tutorProfile?.status || "pending";
  const statusTone = statusToTone(status);
  const statusLabel = formatStatusLabel(status);

  // --- Personal information handlers ---
  const startEditingPersonal = () => {
    if (!tutor) return;
    setPersonalDraft({
      firstName: tutor.firstName || "",
      lastName: tutor.lastName || "",
      phone: tutor.phone || "",
      location: tutor.location || "",
    });
    setPersonalError(null);
    setIsEditingPersonal(true);
  };

  const cancelEditingPersonal = () => {
    setIsEditingPersonal(false);
    setPersonalError(null);
  };

  const savePersonal = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setPersonalError("You're not signed in. Please sign in and try again.");
      return;
    }
    setIsSavingPersonal(true);
    setPersonalError(null);
    try {
      await updateDoc(doc(db, "users", uid), {
        firstName: personalDraft.firstName,
        lastName: personalDraft.lastName,
        phone: personalDraft.phone,
        location: personalDraft.location,
      });
      setTutor((prev) =>
        prev
          ? {
              ...prev,
              firstName: personalDraft.firstName,
              lastName: personalDraft.lastName,
              phone: personalDraft.phone,
              location: personalDraft.location,
            }
          : prev,
      );
      setIsEditingPersonal(false);
    } catch (error) {
      console.error("Error saving personal information:", error);
      setPersonalError("Couldn't save your changes. Please try again.");
    } finally {
      setIsSavingPersonal(false);
    }
  };

  // --- Qualifications handlers ---
  const startEditingQualifications = () => {
    if (!tutor) return;
    setQualDraft({
      bio: tutor.tutorProfile?.bio || "",
      category: tutor.tutorProfile?.category || "",
      degreeClass: tutor.tutorProfile?.degreeClass || "",
      hourlyRate: tutor.tutorProfile?.hourlyRate ?? "",
      specialization: tutor.tutorProfile?.specialization || [],
    });
    setNewSubject("");
    setQualError(null);
    setIsEditingQualifications(true);
  };

  const cancelEditingQualifications = () => {
    setIsEditingQualifications(false);
    setQualError(null);
    setNewSubject("");
  };

  const addSubject = () => {
    const value = newSubject.trim();
    if (!value || qualDraft.specialization.includes(value)) {
      setNewSubject("");
      return;
    }
    setQualDraft((prev) => ({
      ...prev,
      specialization: [...prev.specialization, value],
    }));
    setNewSubject("");
  };

  const removeSubject = (subject: string) => {
    setQualDraft((prev) => ({
      ...prev,
      specialization: prev.specialization.filter((s) => s !== subject),
    }));
  };

  const saveQualifications = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setQualError("You're not signed in. Please sign in and try again.");
      return;
    }
    setIsSavingQualifications(true);
    setQualError(null);
    try {
      const hourlyRateValue = Number(qualDraft.hourlyRate) || 0;
      await updateDoc(doc(db, "users", uid), {
        "tutorProfile.bio": qualDraft.bio,
        "tutorProfile.category": qualDraft.category,
        "tutorProfile.degreeClass": qualDraft.degreeClass,
        "tutorProfile.hourlyRate": hourlyRateValue,
        "tutorProfile.specialization": qualDraft.specialization,
      });
      setTutor((prev) =>
        prev
          ? {
              ...prev,
              tutorProfile: {
                ...prev.tutorProfile,
                bio: qualDraft.bio,
                category: qualDraft.category,
                degreeClass: qualDraft.degreeClass,
                hourlyRate: hourlyRateValue,
                specialization: qualDraft.specialization,
              },
            }
          : prev,
      );
      setIsEditingQualifications(false);
    } catch (error) {
      console.error("Error saving qualifications:", error);
      setQualError("Couldn't save your changes. Please try again.");
    } finally {
      setIsSavingQualifications(false);
    }
  };

  // --- Document upload handlers ---
  const openUploadPanel = () => {
    setUploadDocType("");
    setUploadFile(null);
    setUploadError(null);
    setIsUploadPanelOpen(true);
  };

  const closeUploadPanel = () => {
    setIsUploadPanelOpen(false);
    setUploadDocType("");
    setUploadFile(null);
    setUploadError(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setUploadFile(null);
      return;
    }
    if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
      setUploadError("Please upload a PDF, JPG, or PNG file.");
      setUploadFile(null);
      return;
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setUploadError("File is too large. Max size is 10MB.");
      setUploadFile(null);
      return;
    }
    setUploadError(null);
    setUploadFile(file);
  };

  const handleUploadSubmit = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setUploadError("You're not signed in. Please sign in and try again.");
      return;
    }
    if (!uploadDocType) {
      setUploadError("Please choose a document type.");
      return;
    }
    if (!uploadFile) {
      setUploadError("Please choose a file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    try {
      const storage = getStorage();
      const path = `documents/${uid}/${Date.now()}_${uploadFile.name}`;
      const fileRef = storageRef(storage, path);
      await uploadBytes(fileRef, uploadFile);
      const fileUrl = await getDownloadURL(fileRef);

      const newDocRef = await addDoc(collection(db, "documents"), {
        tutorId: doc(db, "users", uid),
        documentType: uploadDocType,
        fileName: uploadFile.name,
        fileUrl,
        status: "pending",
        uploadedAt: serverTimestamp(),
      });

      setDocuments((prev) => [
        ...prev,
        {
          id: newDocRef.id,
          documentType: uploadDocType,
          fileName: uploadFile.name,
          fileUrl,
          status: "pending",
          uploadedAt: new Date(),
        },
      ]);

      closeUploadPanel();
    } catch (error: any) {
      console.error("Error uploading document:", error);
      const code = error?.code as string | undefined;
      let message = "Couldn't upload your document. Please try again.";
      if (code === "storage/unauthorized" || code === "permission-denied") {
        message =
          "Upload blocked by security rules (permission denied). Check your Firebase Storage and Firestore rules.";
      } else if (code === "storage/unknown") {
        message =
          "Upload failed (storage/unknown) — check your Storage bucket is set up correctly.";
      } else if (code === "storage/quota-exceeded") {
        message = "Upload failed: Storage quota exceeded.";
      } else if (code === "storage/canceled") {
        message = "Upload was canceled.";
      } else if (code) {
        message = `Upload failed: ${code}`;
      }
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedPageWrapper>
        <DashboardLayout navItems={tutorNavItems} userType="tutor" userName="">
          <div className="flex h-64 items-center justify-center bg-cream">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-terracotta" />
          </div>
        </DashboardLayout>
      </ProtectedPageWrapper>
    );
  }

  return (
    <ProtectedPageWrapper>
      <DashboardLayout
        navItems={tutorNavItems}
        userType="tutor"
        userName={tutor ? `${tutor.firstName} ${tutor.lastName}` : ""}
      >
        <div className="space-y-10 bg-cream">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow>Tutor profile</Eyebrow>
              <h1 className="mt-4 font-display text-4xl leading-[1.05] tracking-[-0.01em] text-ink md:text-5xl">
                My <span className="italic text-terracotta">profile</span>
              </h1>
              <p className="mt-3 max-w-xl text-ink-soft">
                Manage your personal information and documents.
              </p>
            </div>
            <Pill tone={statusTone}>{statusLabel}</Pill>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Completion Card */}
              <div className="rounded-2xl border border-line bg-white p-6">
                <div className="flex items-center gap-4">
                  <ProgressRing progress={profileCompletion} size={64} />
                  <div>
                    <p className="font-display text-lg text-ink">
                      Profile completion
                    </p>
                    <p className="mt-1 text-sm text-ink-soft">
                      {profileCompletion < 100
                        ? "Complete your profile to increase your chances of approval."
                        : "Great job! Your profile is complete."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="rounded-2xl border border-line bg-white">
                <div className="flex items-center justify-between gap-2 border-b border-line p-6">
                  <h2 className="font-display text-xl text-ink">
                    Personal information
                  </h2>
                  {!isEditingPersonal && (
                    <button
                      type="button"
                      onClick={startEditingPersonal}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-terracotta transition hover:gap-2"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  )}
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className={fieldLabelClass}>First name</label>
                      <input
                        value={
                          isEditingPersonal
                            ? personalDraft.firstName
                            : tutor?.firstName || ""
                        }
                        readOnly={!isEditingPersonal}
                        onChange={(e) =>
                          setPersonalDraft((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        className={cn(
                          fieldBaseClass,
                          isEditingPersonal
                            ? fieldEditableClass
                            : fieldReadOnlyClass,
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={fieldLabelClass}>Last name</label>
                      <input
                        value={
                          isEditingPersonal
                            ? personalDraft.lastName
                            : tutor?.lastName || ""
                        }
                        readOnly={!isEditingPersonal}
                        onChange={(e) =>
                          setPersonalDraft((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                        className={cn(
                          fieldBaseClass,
                          isEditingPersonal
                            ? fieldEditableClass
                            : fieldReadOnlyClass,
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={fieldLabelClass}>Email</label>
                    <input
                      value={tutor?.email || ""}
                      readOnly
                      className={cn(fieldBaseClass, fieldReadOnlyClass)}
                    />
                    {isEditingPersonal && (
                      <p className="text-xs text-ink-soft">
                        Email is linked to your account and can't be changed
                        here.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className={fieldLabelClass}>Phone</label>
                    <input
                      value={
                        isEditingPersonal
                          ? personalDraft.phone
                          : tutor?.phone || ""
                      }
                      readOnly={!isEditingPersonal}
                      onChange={(e) =>
                        setPersonalDraft((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className={cn(
                        fieldBaseClass,
                        isEditingPersonal
                          ? fieldEditableClass
                          : fieldReadOnlyClass,
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={fieldLabelClass}>Location</label>
                    <input
                      value={
                        isEditingPersonal
                          ? personalDraft.location
                          : tutor?.location || ""
                      }
                      readOnly={!isEditingPersonal}
                      onChange={(e) =>
                        setPersonalDraft((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      className={cn(
                        fieldBaseClass,
                        isEditingPersonal
                          ? fieldEditableClass
                          : fieldReadOnlyClass,
                      )}
                    />
                  </div>

                  {personalError && (
                    <p className="text-sm text-terracotta">{personalError}</p>
                  )}

                  {isEditingPersonal && (
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={cancelEditingPersonal}
                        disabled={isSavingPersonal}
                        className={ghostButtonClass}
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={savePersonal}
                        disabled={isSavingPersonal}
                        className={primaryButtonClass(isSavingPersonal)}
                      >
                        {isSavingPersonal ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Save className="h-3.5 w-3.5" />
                        )}
                        Save changes
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Qualifications */}
              <div className="rounded-2xl border border-line bg-white">
                <div className="flex items-center justify-between gap-2 border-b border-line p-6">
                  <h2 className="font-display text-xl text-ink">
                    Qualifications
                  </h2>
                  {!isEditingQualifications && (
                    <button
                      type="button"
                      onClick={startEditingQualifications}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-terracotta transition hover:gap-2"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  )}
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className={fieldLabelClass}>Degree class</label>
                    <input
                      value={
                        isEditingQualifications
                          ? qualDraft.degreeClass
                          : tutor?.tutorProfile?.degreeClass || ""
                      }
                      readOnly={!isEditingQualifications}
                      onChange={(e) =>
                        setQualDraft((prev) => ({
                          ...prev,
                          degreeClass: e.target.value,
                        }))
                      }
                      className={cn(
                        fieldBaseClass,
                        isEditingQualifications
                          ? fieldEditableClass
                          : fieldReadOnlyClass,
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={fieldLabelClass}>Category</label>
                    {isEditingQualifications ? (
                      <div className="flex flex-wrap gap-2">
                        {categoryOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setQualDraft((prev) => ({
                                ...prev,
                                category: option.value,
                              }))
                            }
                            className={cn(
                              "rounded-full border px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] transition",
                              qualDraft.category === option.value
                                ? "border-terracotta bg-terracotta text-cream"
                                : "border-line bg-sand text-ink-soft hover:border-terracotta/40 hover:text-ink",
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className={cn(fieldBaseClass, fieldReadOnlyClass)}>
                        {tutor?.tutorProfile?.category === "academic"
                          ? "Academic Subjects"
                          : tutor?.tutorProfile?.category === "digital_skills"
                            ? "Digital Skills"
                            : tutor?.tutorProfile?.category || "—"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className={fieldLabelClass}>Hourly rate</label>
                    {isEditingQualifications ? (
                      <input
                        type="number"
                        min={0}
                        value={qualDraft.hourlyRate}
                        onChange={(e) =>
                          setQualDraft((prev) => ({
                            ...prev,
                            hourlyRate:
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                          }))
                        }
                        className={cn(fieldBaseClass, fieldEditableClass)}
                      />
                    ) : (
                      <div className={cn(fieldBaseClass, fieldReadOnlyClass)}>
                        {tutor?.tutorProfile?.hourlyRate
                          ? `₦${tutor.tutorProfile.hourlyRate.toLocaleString()}`
                          : "—"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className={fieldLabelClass}>Subjects</label>
                    <div className="flex flex-wrap gap-2">
                      {(isEditingQualifications
                        ? qualDraft.specialization
                        : tutor?.tutorProfile?.specialization || []
                      ).length ? (
                        (isEditingQualifications
                          ? qualDraft.specialization
                          : tutor?.tutorProfile?.specialization || []
                        ).map((subject) => (
                          <Pill key={subject} tone="terracotta">
                            <span className="flex items-center gap-1.5 normal-case tracking-normal">
                              {subject}
                              {isEditingQualifications && (
                                <button
                                  type="button"
                                  onClick={() => removeSubject(subject)}
                                  className="hover:opacity-70"
                                  aria-label={`Remove ${subject}`}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </span>
                          </Pill>
                        ))
                      ) : (
                        <p className="text-sm text-ink-soft">
                          No subjects added yet.
                        </p>
                      )}
                    </div>
                    {isEditingQualifications && (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          placeholder="Add a subject"
                          value={newSubject}
                          onChange={(e) => setNewSubject(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addSubject();
                            }
                          }}
                          className={cn(
                            fieldBaseClass,
                            fieldEditableClass,
                            "flex-1",
                          )}
                        />
                        <button
                          type="button"
                          onClick={addSubject}
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-sand text-ink-soft transition hover:border-terracotta/40 hover:text-terracotta"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className={fieldLabelClass}>Bio</label>
                    <textarea
                      value={
                        isEditingQualifications
                          ? qualDraft.bio
                          : tutor?.tutorProfile?.bio || ""
                      }
                      readOnly={!isEditingQualifications}
                      onChange={(e) =>
                        setQualDraft((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      rows={4}
                      className={cn(
                        fieldBaseClass,
                        "resize-none",
                        isEditingQualifications
                          ? fieldEditableClass
                          : fieldReadOnlyClass,
                      )}
                    />
                  </div>

                  {qualError && (
                    <p className="text-sm text-terracotta">{qualError}</p>
                  )}

                  {isEditingQualifications && (
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={cancelEditingQualifications}
                        disabled={isSavingQualifications}
                        className={ghostButtonClass}
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={saveQualifications}
                        disabled={isSavingQualifications}
                        className={primaryButtonClass(isSavingQualifications)}
                      >
                        {isSavingQualifications ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Save className="h-3.5 w-3.5" />
                        )}
                        Save changes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Documents & Status */}
            <div className="space-y-6">
              {/* Verification Status */}
              <div className="rounded-2xl border border-line bg-white p-6">
                <h2 className="font-display text-lg text-ink mb-4">
                  Verification status
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink-soft">
                      Account status
                    </span>
                    <Pill tone={statusTone}>{statusLabel}</Pill>
                  </div>
                  <div className="h-px bg-line" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink-soft">
                      Member since
                    </span>
                    <span className="text-sm font-medium text-ink">
                      {tutor?.createdAt?.toDate
                        ? new Date(
                            tutor.createdAt.toDate(),
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="rounded-2xl border border-line bg-white">
                <div className="flex items-center gap-2 border-b border-line p-6">
                  <FileText className="h-4 w-4 text-terracotta" />
                  <h2 className="font-display text-lg text-ink">
                    Documents
                  </h2>
                </div>
                <div className="divide-y divide-line">
                  {documents.length > 0 ? (
                    documents.map((document) => {
                      const statusConfig =
                        documentStatusConfig[document.status] ||
                        documentStatusConfig.pending;
                      const StatusIcon = statusConfig.icon;
                      const toneChipClass =
                        statusConfig.tone === "sage"
                          ? "bg-sage/10 text-sage"
                          : statusConfig.tone === "terracotta"
                            ? "bg-terracotta/10 text-terracotta"
                            : "bg-ochre/10 text-ochre";

                      return (
                        <div key={document.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                                toneChipClass,
                              )}
                            >
                              <StatusIcon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-ink">
                                {document.fileName}
                              </p>
                              <p className="mt-0.5 text-xs capitalize text-ink-soft">
                                {document.documentType.replace("_", " ")}
                              </p>
                            </div>
                            <Pill tone={statusConfig.tone}>
                              {statusConfig.label}
                            </Pill>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <EmptyState
                      icon={FileText}
                      title="No documents yet"
                      description="Upload your CV, certificates, or ID to get verified."
                    />
                  )}
                </div>
                <div className="p-4 border-t border-line space-y-3">
                  {isUploadPanelOpen ? (
                    <>
                      <div className="space-y-2">
                        <label className={fieldLabelClass}>
                          Document type
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {documentTypeOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setUploadDocType(option.value)}
                              className={cn(
                                "rounded-full border px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.1em] transition",
                                uploadDocType === option.value
                                  ? "border-terracotta bg-terracotta text-cream"
                                  : "border-line bg-sand text-ink-soft hover:border-terracotta/40 hover:text-ink",
                              )}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className={fieldLabelClass}>File</label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileSelect}
                          className="w-full text-sm text-ink-soft file:mr-4 file:rounded-full file:border-0 file:bg-terracotta/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.08em] file:text-terracotta hover:file:bg-terracotta/20"
                        />
                        <p className="text-xs text-ink-soft">
                          PDF, JPG, or PNG. Max 10MB.
                        </p>
                      </div>

                      {uploadError && (
                        <p className="text-sm text-terracotta">
                          {uploadError}
                        </p>
                      )}

                      <div className="flex items-center justify-end gap-3 pt-1">
                        <button
                          type="button"
                          onClick={closeUploadPanel}
                          disabled={isUploading}
                          className={ghostButtonClass}
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleUploadSubmit}
                          disabled={isUploading}
                          className={primaryButtonClass(isUploading)}
                        >
                          {isUploading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Upload className="h-3.5 w-3.5" />
                          )}
                          Upload
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={openUploadPanel}
                      className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-line bg-cream px-4 py-4 transition hover:-translate-y-0.5 hover:border-terracotta/40 hover:bg-terracotta/[0.04]"
                    >
                      <span className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-terracotta/10 text-terracotta transition group-hover:bg-terracotta group-hover:text-cream">
                          <Upload className="h-4 w-4" />
                        </span>
                        <span className="text-sm font-medium text-ink">
                          Upload document
                        </span>
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-ink-soft opacity-0 transition group-hover:opacity-100" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedPageWrapper>
  );
}