import * as crypto from "crypto";

export const generateId = (): string => {
  return crypto.randomBytes(16).toString("hex");
};

export const hashPassword = async (password: string): Promise<string> => {
  const bcrypt = require("bcrypt");
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (
  password: string,
  hash: string
): Promise<boolean> => {
  const bcrypt = require("bcrypt");
  return bcrypt.compare(password, hash);
};

export const createJWT = (
  payload: any,
  secret: string,
  expiresIn: string = "7d"
): string => {
  const jwt = require("jsonwebtoken");
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyJWT = (token: string, secret: string): any => {
  const jwt = require("jsonwebtoken");
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

export const formatResponse = <T = any>(
  success: boolean,
  data?: T,
  message?: string,
  code?: string
) => {
  return {
    success,
    ...(data && { data }),
    ...(message && { message }),
    ...(code && { code }),
  };
};

export const formatPaginatedResponse = <T = any>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
) => {
  return {
    success: true,
    data,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

export const extractBearerToken = (
  authHeader?: string
): string | null => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
};

export const getCurrentTimestamp = (): Date => {
  return new Date();
};

export const isFutureDate = (date: Date): boolean => {
  return date > new Date();
};

export const formatError = (message: string, code: string = "ERROR") => {
  return {
    success: false,
    error: message,
    code,
  };
};
