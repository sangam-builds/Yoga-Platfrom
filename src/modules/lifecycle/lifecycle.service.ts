import { computeUserState, type UserState } from "./lifecycle.state.ts";
import { lifecycleRepository, LifecycleRepository } from "./lifecycle.repository.ts";
import { NotFoundError } from "../../lib/errors.ts";

export class LifecycleService {
  private repo: LifecycleRepository;

  constructor(repo: LifecycleRepository = lifecycleRepository) {
    this.repo = repo;
  }

  async getUserState(userId: string, returnUrl?: string | null): Promise<UserState> {
    const data = await this.repo.getUserLifecycleData(userId);
    if (!data) {
      throw new NotFoundError("User not found");
    }

    return computeUserState({
      user: data.user,
      onboardingProgress: data.onboardingProgress,
      bookingsCount: data.bookingsCount,
      hasActiveSubscription: data.hasActiveSubscription,
      returnUrl,
    });
  }

  async dismissChecklist(userId: string) {
    await this.repo.dismissChecklist(userId);
    return { success: true };
  }
}

export const lifecycleService = new LifecycleService();
