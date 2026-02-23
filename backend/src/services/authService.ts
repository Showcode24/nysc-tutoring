import { PrismaClient, UserType, AdminRole } from "@prisma/client";
import {
  hashPassword,
  comparePasswords,
  createJWT,
  verifyJWT,
} from "@/utils/index";
import {
  TutorRegisterRequest,
  TutorLoginRequest,
  AdminCreateRequest,
  AdminLoginRequest,
  JWTPayload,
} from "@/types/index";

const prisma = new PrismaClient();

export class AuthService {
  /**
   * Register a new tutor
   * Creates user + tutor records
   * Initial status: REGISTERED_RESTRICTED
   */
  static async registerTutor(input: TutorRegisterRequest) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error("Email already registered");
    }

    // Hash password
    const hashedPassword = await hashPassword(input.password);

    // Create user + tutor in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          userType: UserType.TUTOR,
        },
      });

      const tutor = await tx.tutor.create({
        data: {
          userId: user.id,
          specialization: input.specialization,
          yearsOfExperience: input.yearsOfExperience,
          hourlyRate: input.hourlyRate,
          bio: input.bio,
        },
      });

      return { user, tutor };
    });

    return result;
  }

  /**
   * Tutor login
   * Returns JWT token
   */
  static async tutorLogin(input: TutorLoginRequest) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: { tutor: true },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const passwordMatch = await comparePasswords(input.password, user.password);
    if (!passwordMatch) {
      throw new Error("Invalid email or password");
    }

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      userType: "TUTOR",
    };

    const token = createJWT(payload, process.env.JWT_SECRET || "");

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        tutorId: user.tutor?.id,
      },
      token,
    };
  }

  /**
   * Create a new admin user
   * Only super admins can create other admins
   */
  static async createAdmin(input: AdminCreateRequest, createdBy: string) {
    // Verify the creator is a super admin
    const creator = await prisma.admin.findUnique({
      where: { userId: createdBy },
    });

    if (!creator || creator.role !== AdminRole.SUPER_ADMIN) {
      throw new Error(
        "Only super admins can create new admins"
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error("Email already registered");
    }

    // Hash password
    const hashedPassword = await hashPassword(input.password);

    // Create user + admin in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          firstName: input.firstName,
          lastName: input.lastName,
          userType: UserType.ADMIN,
        },
      });

      const admin = await tx.admin.create({
        data: {
          userId: user.id,
          role: input.role,
          department: input.department,
        },
      });

      return { user, admin };
    });

    return result;
  }

  /**
   * Admin login
   * Returns JWT token with role information
   */
  static async adminLogin(input: AdminLoginRequest) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: { admin: true },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const passwordMatch = await comparePasswords(input.password, user.password);
    if (!passwordMatch) {
      throw new Error("Invalid email or password");
    }

    if (!user.admin) {
      throw new Error("User is not an admin");
    }

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      userType: "ADMIN",
      adminRole: user.admin.role,
    };

    const token = createJWT(payload, process.env.JWT_SECRET || "");

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        adminId: user.admin.id,
        adminRole: user.admin.role,
      },
      token,
    };
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): JWTPayload | null {
    const payload = verifyJWT(token, process.env.JWT_SECRET || "");
    return payload as JWTPayload | null;
  }

  /**
   * Get user details by ID
   */
  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        userType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }
}

export default AuthService;
