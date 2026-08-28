export { getFirebaseClientConfig, isFirebaseConfigured } from './env';
export {
  getFirebaseApp,
  getFirebaseAuth,
  getFirebaseFunctions,
  getFirebaseStorage,
  getFirestoreDb,
} from './client';
export {
  getGuidedExerciseOpening,
  sendGuidedExerciseMessage,
  toUserFacingGuideError,
} from './guided-exercise';
export type {
  GetGuidedExerciseOpeningInput,
  GetGuidedExerciseOpeningResult,
  GuidedExerciseChatTurn,
  SendGuidedExerciseMessageInput,
  SendGuidedExerciseMessageResult,
} from './guided-exercise';
export {
  createUserProfileOnSignUp,
  touchUserProfileOnSignIn,
} from './user-profile';
export {
  connectionDocumentId,
  createConnection,
  displayLabelForUser,
  getUserPublicProfile,
  listCircleMembers,
  listConnectionsForUser,
  removeConnection,
} from './connections';
export type {
  CircleMember,
  ConnectionRecord,
  UserPublicProfile,
} from './connections';
export {
  buildCircleInviteUrl,
  createCircleInvite,
  createInviteToken,
  getCircleInvite,
} from './circle-invites';
export type {
  CircleInviteDocument,
  CircleInviteRecord,
  CircleInviteStatus,
} from './circle-invites';
export {
  listCircleRecommendations,
  recommendationFromUserId,
} from './user-recommendations';
export type { CircleRecommendation } from './user-recommendations';
export {
  getDailyConversationOpening,
  sendDailyConversationMessage,
  toUserFacingDailyConversationError,
} from './daily-conversation';
export type {
  DailyConversationMessage,
  DailyConversationMessageDebug,
  DailyConversationPromptContext,
  DailyConversationState,
  GetDailyConversationOpeningResult,
  SendDailyConversationMessageResult,
} from './daily-conversation';
