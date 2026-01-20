import Redis from "ioredis";
import { redis as redisConfig } from "@/config";

/**
 * Redis 클라이언트 싱글톤
 */
let redisClient: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    redisClient.on("error", (err) => {
      console.error("Redis error:", err);
    });

    redisClient.on("connect", () => {
      console.log("Redis connected");
    });
  }

  return redisClient;
};

export const redis = getRedisClient();

/**
 * Redis 캐시 헬퍼 함수들
 */

// 캐시 가져오기
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Redis get error:", error);
    return null;
  }
};

// 캐시 설정 (TTL: 초 단위)
export const setCache = async <T>(
  key: string,
  value: T,
  ttl?: number
): Promise<void> => {
  try {
    const data = JSON.stringify(value);
    if (ttl) {
      await redis.setex(key, ttl, data);
    } else {
      await redis.set(key, data);
    }
  } catch (error) {
    console.error("Redis set error:", error);
  }
};

// 캐시 삭제
export const deleteCache = async (key: string): Promise<void> => {
  try {
    await redis.del(key);
  } catch (error) {
    console.error("Redis delete error:", error);
  }
};

// 패턴으로 캐시 삭제
export const deleteCacheByPattern = async (pattern: string): Promise<void> => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("Redis delete by pattern error:", error);
  }
};

// 캐시 존재 여부 확인
export const cacheExists = async (key: string): Promise<boolean> => {
  try {
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    console.error("Redis exists error:", error);
    return false;
  }
};

// TTL 설정
export const setCacheTTL = async (key: string, ttl: number): Promise<void> => {
  try {
    await redis.expire(key, ttl);
  } catch (error) {
    console.error("Redis expire error:", error);
  }
};
