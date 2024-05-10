import { Override } from '@/utils/override';

/**
 * Represents the properties of a Profile.
 */
export type ProfileProps = {
  name: string;
  sonarr: Record<string, unknown>;
  radarr: Record<string, unknown>;
  autoApprove: boolean;
  autoApproveTv: boolean;
  quota: number;
  isDefault: boolean;
};

/**
 * Represents the properties for creating a Profile.
 */
export type CreateProfileProps = Override<
  ProfileProps,
  {
    // TODO: add fields to override
  }
>;
