import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

const prisma = new PrismaClient();

export async function register(email: string, password: string, nickname: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('该邮箱已注册');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, nickname },
  });

  const payload = { userId: user.id, email: user.email };
  return {
    user: { id: user.id, email: user.email, nickname: user.nickname, avatar: user.avatar, settings: { aiMode: user.aiMode, theme: user.theme, voiceAutoStop: true, voiceAutoStopDelay: 1500, language: 'zh-CN' }, createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString() },
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('邮箱或密码错误');
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error('邮箱或密码错误');
  }

  const payload = { userId: user.id, email: user.email };
  return {
    user: { id: user.id, email: user.email, nickname: user.nickname, avatar: user.avatar, settings: { aiMode: user.aiMode, theme: user.theme, voiceAutoStop: true, voiceAutoStopDelay: 1500, language: 'zh-CN' }, createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString() },
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

export async function refreshToken(token: string) {
  const payload = verifyRefreshToken(token);
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    throw new Error('用户不存在');
  }

  const newPayload = { userId: user.id, email: user.email };
  return {
    accessToken: generateAccessToken(newPayload),
    refreshToken: generateRefreshToken(newPayload),
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('用户不存在');
  return {
    id: user.id, email: user.email, nickname: user.nickname, avatar: user.avatar,
    settings: { aiMode: user.aiMode, theme: user.theme, voiceAutoStop: true, voiceAutoStopDelay: 1500, language: 'zh-CN' },
    createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString(),
  };
}
