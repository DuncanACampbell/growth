import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from 'firebase/firestore';

import {
  displayLabelForUser,
  getUserPublicProfile,
  type UserPublicProfile,
} from './connections';
import { getFirestoreDb } from './client';

export type CircleRecommendation = {
  userId: string;
  displayLabel: string;
};

const USERS_COLLECTION = 'users';
const QUERY_BATCH = 40;
const MAX_RECOMMENDATIONS = 20;

/**
 * Prototype discovery: newest users first, excluding self and existing connections.
 * Fetches a batch then filters client-side so we can still reach 20 eligible users.
 */
export async function listCircleRecommendations(input: {
  currentUserId: string;
  connectedUserIds?: string[];
}): Promise<CircleRecommendation[]> {
  const currentUserId = input.currentUserId.trim();
  if (!currentUserId) {
    return [];
  }

  const excluded = new Set<string>([
    currentUserId,
    ...(input.connectedUserIds ?? []),
  ]);

  const snap = await getDocs(
    query(
      collection(getFirestoreDb(), USERS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(QUERY_BATCH),
    ),
  );

  const recommendations: CircleRecommendation[] = [];

  for (const item of snap.docs) {
    if (recommendations.length >= MAX_RECOMMENDATIONS) {
      break;
    }
    if (excluded.has(item.id)) {
      continue;
    }

    const data = item.data();
    const profile: UserPublicProfile = {
      uid: item.id,
      displayName:
        typeof data.displayName === 'string' ? data.displayName : null,
      email: typeof data.email === 'string' ? data.email : null,
    };

    recommendations.push({
      userId: item.id,
      displayLabel: displayLabelForUser(profile),
    });
  }

  return recommendations;
}

/** Loads a single user for display after a connection is created elsewhere. */
export async function recommendationFromUserId(
  userId: string,
): Promise<CircleRecommendation> {
  const profile = await getUserPublicProfile(userId);
  return {
    userId,
    displayLabel: displayLabelForUser(profile),
  };
}
