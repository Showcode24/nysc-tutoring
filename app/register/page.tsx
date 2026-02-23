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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { PublicLayout } from "../src/components/layouts/public-layout";
import Link from "next/link";

const steps = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Qualifications", icon: GraduationCap },
  { id: 3, title: "Documents", icon: FileText },
  { id: 4, title: "Verification", icon: Shield },
];

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Spanish",
  "French",
  "Computer Science",
  "History",
  "Geography",
  "Economics",
  "Music",
  "Art",
];

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    bio: "",
    education: "",
    experience: "",
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
      const maxSize = 5 * 1024 * 1024; // 5MB
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
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Validate password match
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Passwords Don't Match",
          description: "Please make sure your passwords are identical.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!formData.password || formData.password.length < 8) {
        toast({
          title: "Invalid Password",
          description: "Password must be at least 8 characters long.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Step 1: Register user
      const experienceMap: { [key: string]: number } = {
        "0-1": 1,
        "1-3": 2,
        "3-5": 4,
        "5+": 5,
      };

      const yearsOfExperience = parseInt(
        Object.keys(experienceMap).find(
          (key) => experienceMap[key].toString() === formData.experience,
        ) || "0",
      );

      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        specialization: formData.subjects.join(", "),
        yearsOfExperience,
        bio: formData.bio,
        hourlyRate: parseFloat(formData.hourlyRate) || 0,
      };

      const registerResponse = await fetch(
        "http://localhost:5000/api/tutors/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registrationData),
        },
      );

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const registeredUser = await registerResponse.json();
      const tutorId = registeredUser.data?.id || registeredUser.id;

      // Step 2: Upload documents
      const documentTypeMap: { [key: string]: string } = {
        id: "GOVERNMENT_ID",
        degree: "DEGREE",
        cert: "CERTIFICATE",
      };

      for (const [docKey, docFile] of Object.entries(uploadedFiles)) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", docFile.file);
        formDataUpload.append("document_type", documentTypeMap[docKey]);
        formDataUpload.append("file_name", docFile.name);
        formDataUpload.append("tutor_id", tutorId);

        try {
          setUploadProgress((prev) => ({ ...prev, [docKey]: 25 }));

          const uploadResponse = await fetch(
            "http://localhost:5000/documents/upload",
            {
              method: "POST",
              body: formDataUpload,
            },
          );

          if (!uploadResponse.ok) {
            console.error(
              `[v0] Failed to upload ${docKey}:`,
              await uploadResponse.text(),
            );
          } else {
            setUploadProgress((prev) => ({ ...prev, [docKey]: 100 }));
          }
        } catch (uploadError) {
          console.error(`[v0] Upload error for ${docKey}:`, uploadError);
        }
      }

      toast({
        title: "Application Submitted!",
        description:
          "Your application and documents have been received. We'll review them soon.",
      });

      router.push("/tutor/dashboard");
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

  return (
    <PublicLayout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Become a Tutor
            </h1>
            <p className="text-muted-foreground">
              Join our community of verified professional tutors
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              {/* Progress line */}
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
                      currentStep > step.id
                        ? "bg-primary text-primary-foreground"
                        : currentStep === step.id
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

          {/* Form Card */}
          <div className="card-elevated p-6 md:p-8">
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
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          updateFormData("firstName", e.target.value)
                        }
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          updateFormData("lastName", e.target.value)
                        }
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Create Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          updateFormData("password", e.target.value)
                        }
                        placeholder="At least 8 characters"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          updateFormData("confirmPassword", e.target.value)
                        }
                        placeholder="Re-enter password"
                        className={
                          formData.confirmPassword &&
                          formData.password !== formData.confirmPassword
                            ? "border-destructive"
                            : ""
                        }
                      />
                      {formData.confirmPassword &&
                        formData.password !== formData.confirmPassword && (
                          <p className="text-xs text-destructive">
                            Passwords do not match
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
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
                    <h2 className="text-xl font-semibold mb-1">
                      Qualifications
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Share your teaching background
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="education">Highest Education</Label>
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
                    <Label htmlFor="experience">Teaching Experience</Label>
                    <Select
                      value={formData.experience}
                      onValueChange={(value) =>
                        updateFormData("experience", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Years of experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">Less than 1 year</SelectItem>
                        <SelectItem value="1-3">1-3 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="5+">5+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Subjects You Can Teach</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {subjects.map((subject) => (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => toggleSubject(subject)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                            formData.subjects.includes(subject)
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-accent",
                          )}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => updateFormData("bio", e.target.value)}
                      placeholder="Tell students about your teaching approach and what makes you a great tutor..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate (₦)</Label>
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
                        description:
                          "Passport, driver's license, or national ID",
                      },
                      {
                        id: "degree",
                        label: "Degree Certificate",
                        description: "Your highest education certificate",
                      },
                      {
                        id: "cert",
                        label: "Teaching Certification (Optional)",
                        description: "Any relevant certifications",
                      },
                    ].map((doc) => {
                      const fileData = uploadedFiles[doc.id];
                      const progress = uploadProgress[doc.id];
                      return (
                        <div
                          key={doc.id}
                          className={cn(
                            "border rounded-lg p-4 transition-colors",
                            fileData
                              ? "border-primary bg-primary/5"
                              : "border-dashed border-border hover:border-primary/50",
                          )}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={cn(
                                "p-2 rounded-lg",
                                fileData ? "bg-primary/10" : "bg-muted",
                              )}
                            >
                              {fileData ? (
                                <CheckCircle className="w-5 h-5 text-primary" />
                              ) : (
                                <Upload className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{doc.label}</p>
                              <p className="text-sm text-muted-foreground">
                                {doc.description}
                              </p>
                              {fileData && (
                                <p className="text-sm text-primary mt-1 flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4" />
                                  {fileData.name}
                                </p>
                              )}
                              {progress !== undefined && progress < 100 && (
                                <div className="mt-2 w-full bg-muted rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              )}
                            </div>
                            <input
                              type="file"
                              id={`upload-${doc.id}`}
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileUpload(doc.id, e)}
                              className="hidden"
                            />
                            <Button
                              variant={fileData ? "secondary" : "outline"}
                              size="sm"
                              onClick={() =>
                                document
                                  .getElementById(`upload-${doc.id}`)
                                  ?.click()
                              }
                            >
                              {fileData ? "Change" : "Upload"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Accepted formats: PDF, JPG, PNG. Maximum file size: 5MB
                  </p>
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
                          You may be asked to schedule a verification
                          appointment
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          Once approved, you'll gain access to tutoring
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

            {/* Navigation Buttons */}
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
                <Button onClick={handleNext}>
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
    </PublicLayout>
  );
}
