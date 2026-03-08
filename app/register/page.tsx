"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Upload,
  User,
  GraduationCap,
  FileText,
  Shield,
  MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  determineCategory,
  submitTutorRegistration,
  submitTutorDocuments,
} from "../firebase/registerService";

const steps = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Qualifications", icon: GraduationCap },
  { id: 3, title: "Documents", icon: FileText },
  { id: 4, title: "Verification", icon: Shield },
];

const degreeClasses = [
  "First Class",
  "Second Class Upper",
  "Second Class Lower",
  "Third Class",
  "Pass",
];

const degreeClassToTeaching = {
  "First Class": {
    category: "Academic Subjects",
    subjects: [
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "English Language",
      "Literature",
      "History",
      "Geography",
      "Economics",
    ],
  },
  "Second Class Upper": {
    category: "Academic Subjects",
    subjects: [
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "English Language",
      "Literature",
      "History",
      "Geography",
      "Economics",
    ],
  },
  "Second Class Lower": {
    category: "Digital Skills",
    subjects: [
      "Web Development",
      "Mobile App Development",
      "Data Science",
      "UI/UX Design",
      "Digital Marketing",
      "Cloud Computing",
      "Cybersecurity",
    ],
  },
  "Third Class": {
    category: "Digital Skills",
    subjects: [
      "Web Development",
      "Mobile App Development",
      "Data Science",
      "UI/UX Design",
      "Digital Marketing",
      "Cloud Computing",
      "Cybersecurity",
    ],
  },
  Pass: {
    category: "Digital Skills",
    subjects: [
      "Web Development",
      "Mobile App Development",
      "Data Science",
      "UI/UX Design",
      "Digital Marketing",
      "Cloud Computing",
      "Cybersecurity",
    ],
  },
};

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    education: "",
    degreeClass: "",
    subjects: [] as string[],
    hourlyRate: "",
    agreedToTerms: false,
  });

  const [uploadedFiles, setUploadedFiles] = useState<{
    [key: string]: { file: File; name: string };
  }>({});

  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});

  const handleFileUpload = (
    docType: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024;
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB",
          variant: "destructive",
        });
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Only PDF, JPG, and PNG files are allowed",
          variant: "destructive",
        });
        return;
      }

      setUploadedFiles((prev) => ({
        ...prev,
        [docType]: { file, name: file.name },
      }));
      toast({
        title: "File selected",
        description: `${file.name} ready to upload`,
      });
    }
  };

  const handleNext = () => {
    if (!isCurrentStepComplete()) {
      const stepName = [
        "",
        "Personal Information",
        "Qualifications",
        "Documents",
        "Verification",
      ][currentStep];
      toast({
        title: `Complete ${stepName}`,
        description: "Please fill in all required fields before continuing.",
        variant: "destructive",
      });
      return;
    }
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      if (!formData.location) {
        toast({
          title: "Missing Location",
          description: "Please provide your location.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!formData.degreeClass) {
        toast({
          title: "Missing Degree Class",
          description: "Please select your degree classification.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        specialization: formData.subjects.join(", "),
        bio: formData.bio,
        hourlyRate: parseFloat(formData.hourlyRate) || 0,
        degreeClass: formData.degreeClass,
        category: determineCategory(formData.degreeClass),
      };

      const result = await submitTutorRegistration(registrationData);

      if (!result.success || !result.uid) {
        throw new Error(result.message || "Registration failed");
      }

      if (Object.keys(uploadedFiles).length > 0) {
        const uploadResult = await submitTutorDocuments(
          result.uid,
          uploadedFiles,
          (docType, progress) =>
            setUploadProgress((prev) => ({ ...prev, [docType]: progress })),
        );

        if (!uploadResult.success) {
          throw new Error(uploadResult.message || "Failed to upload documents");
        }
      }

      // Show success screen then redirect after 5 seconds
      setIsSubmitted(true);
      setTimeout(() => {
        router.push("/tutor/dashboard");
      }, 5000);
    } catch (error) {
      toast({
        title: "Registration Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to register. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSubject = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  // Validation functions for each step
  const isStep1Complete = () => {
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.phone.trim() !== "" &&
      formData.location.trim() !== ""
    );
  };

  const isStep2Complete = () => {
    return (
      formData.education.trim() !== "" &&
      formData.degreeClass.trim() !== "" &&
      formData.subjects.length > 0 &&
      formData.hourlyRate.trim() !== "" &&
      parseFloat(formData.hourlyRate) > 0
    );
  };

  const isStep3Complete = () => {
    return (
      Object.keys(uploadedFiles).length === 3 // All 3 documents must be uploaded
    );
  };

  const isStep4Complete = () => {
    return formData.agreedToTerms;
  };

  const isCurrentStepComplete = () => {
    switch (currentStep) {
      case 1:
        return isStep1Complete();
      case 2:
        return isStep2Complete();
      case 3:
        return isStep3Complete();
      case 4:
        return isStep4Complete();
      default:
        return false;
    }
  };

  // Success screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card border border-border rounded-lg shadow-sm p-8 text-center space-y-6"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Application Submitted!</h2>
            <p className="text-muted-foreground">
              Thank you,{" "}
              <span className="font-medium text-foreground">
                {formData.firstName}
              </span>
              ! Your application and documents have been received.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4 bg-muted/30 text-left space-y-2">
            <p className="text-sm font-medium">What happens next?</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>
                  Our team will review your application within 2-3 business days
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>
                  You may be asked to schedule a verification appointment
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>
                  Once approved, you'll gain full access to tutoring
                  opportunities
                </span>
              </li>
            </ul>
          </div>

          <p className="text-sm text-muted-foreground">
            Redirecting you to your dashboard in a few seconds...
          </p>

          <Button
            onClick={() => router.push("/tutor/dashboard")}
            className="w-full"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Become a Tutor
          </h1>
          <p className="text-muted-foreground text-lg">
            Join our community of verified professional tutors
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-5 h-0.5 bg-border" />
            <div
              className="absolute left-0 top-5 h-0.5 bg-primary transition-all duration-300"
              style={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
              }}
            />
            {steps.map((step) => (
              <div
                key={step.id}
                className="relative flex flex-col items-center"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10",
                    currentStep >= step.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium hidden sm:block",
                    currentStep >= step.id
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-sm p-6 md:p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-semibold mb-1">
                    Personal Information
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Tell us about yourself
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        updateFormData("firstName", e.target.value)
                      }
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        updateFormData("lastName", e.target.value)
                      }
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Location *
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        updateFormData("location", e.target.value)
                      }
                      placeholder="City, Country"
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Qualifications */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-semibold mb-1">Qualifications</h2>
                  <p className="text-sm text-muted-foreground">
                    Share your teaching background
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="education">Highest Education *</Label>
                    <Select
                      value={formData.education}
                      onValueChange={(value) =>
                        updateFormData("education", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your education level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bachelors">
                          Bachelor's Degree
                        </SelectItem>
                        <SelectItem value="masters">Master's Degree</SelectItem>
                        <SelectItem value="phd">Ph.D.</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="degreeClass">Degree Classification</Label>
                    <Select
                      value={formData.degreeClass}
                      onValueChange={(value) =>
                        updateFormData("degreeClass", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select degree class" />
                      </SelectTrigger>
                      <SelectContent>
                        {degreeClasses.map((cls) => (
                          <SelectItem key={cls} value={cls}>
                            {cls}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.degreeClass && (
                  <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-900">
                    <h3 className="font-medium text-sm mb-3">
                      Teaching Category & Available Subjects
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Category
                        </p>
                        <p className="text-base font-semibold text-primary">
                          {
                            degreeClassToTeaching[
                              formData.degreeClass as keyof typeof degreeClassToTeaching
                            ]?.category
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          Subjects You Can Teach
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {degreeClassToTeaching[
                            formData.degreeClass as keyof typeof degreeClassToTeaching
                          ]?.subjects.map((subject) => (
                            <button
                              key={subject}
                              type="button"
                              onClick={() => toggleSubject(subject)}
                              className={cn(
                                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                                formData.subjects.includes(subject)
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-white dark:bg-slate-800 text-foreground hover:bg-accent border border-border",
                              )}
                            >
                              {subject}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => updateFormData("bio", e.target.value)}
                    placeholder="Tell students about your teaching approach..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (₦) *</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.hourlyRate}
                    onChange={(e) =>
                      updateFormData("hourlyRate", e.target.value)
                    }
                    placeholder="e.g., 5000.00"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Price in Nigerian Naira (₦)
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Documents */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-semibold mb-1">Documents</h2>
                  <p className="text-sm text-muted-foreground">
                    Upload required verification documents
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      id: "id",
                      label: "Government-issued ID",
                      description: "Passport, driver's license, or national ID",
                    },
                    {
                      id: "degree",
                      label: "Degree Certificate",
                      description: "Your highest education qualification",
                    },
                    {
                      id: "cert",
                      label: "Professional Certificate",
                      description:
                        "Teaching certification or other credentials",
                    },
                  ].map((doc) => (
                    <div
                      key={doc.id}
                      className="border border-border rounded-lg p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <label className="font-medium text-sm">
                            {doc.label}
                          </label>
                          <p className="text-xs text-muted-foreground mt-1">
                            {doc.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Accepted formats: PDF, JPG, PNG (Max 5MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          id={`file-${doc.id}`}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(doc.id, e)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document.getElementById(`file-${doc.id}`)?.click()
                          }
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                      {uploadedFiles[doc.id] && (
                        <div className="mt-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600">
                            {uploadedFiles[doc.id].name}
                          </span>
                        </div>
                      )}
                      {uploadProgress[doc.id] > 0 &&
                        uploadProgress[doc.id] < 100 && (
                          <div className="mt-2">
                            <div className="h-1 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${uploadProgress[doc.id]}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {uploadProgress[doc.id]}% uploaded
                            </p>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Verification */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-semibold mb-1">Almost Done!</h2>
                  <p className="text-sm text-muted-foreground">
                    Review and submit your application
                  </p>
                </div>

                <div className="rounded-lg border border-border p-4 bg-muted/30">
                  <h3 className="font-medium mb-3">What happens next?</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        Our team will review your application within 2-3
                        business days
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        You may be asked to schedule a verification appointment
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        Once approved, you'll gain full access to tutoring
                        opportunities
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={formData.agreedToTerms}
                    onCheckedChange={(checked) =>
                      updateFormData("agreedToTerms", checked)
                    }
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-muted-foreground leading-relaxed"
                  >
                    I agree to Kopa360's{" "}
                    <a href="#" className="text-primary underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-primary underline">
                      Privacy Policy
                    </a>
                    . I consent to background verification and confirm all
                    information provided is accurate.
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            {currentStep > 1 ? (
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="ghost">Already have an account?</Button>
              </Link>
            )}

            {currentStep < 4 ? (
              <Button onClick={handleNext} disabled={!isCurrentStepComplete()}>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!formData.agreedToTerms || isLoading}
              >
                {isLoading ? "Submitting..." : "Submit Application"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
