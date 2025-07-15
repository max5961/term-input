import type { createActionsWithLeader } from "./createKeymaps.js";
import { UserConfig, type Action } from "./UserConfig.js";

type Params = Parameters<typeof createActionsWithLeader>;

export class ActionStore {
    private active: Set<Action>;
    private leader: Params[0];
    private leaderTimeout: Params[1];
    #isPaused: boolean;

    constructor(...params: Params) {
        this.active = new Set();
        this.leader = params[0];
        this.leaderTimeout = params[1];
        this.#isPaused = false;
    }

    /**
     * Subscribes action(s) to the store based on *deep equality* of each action.
     * Returns a function to unsubscribe each of the provided actions.
     */
    public subscribe = (...actions: Action[]) => {
        actions.forEach((action) => this.active.add(action));
        return () => {
            actions.forEach((action) => this.active.delete(action));
        };
    };

    /**
     * Returns the current set of actions, or an empty list if paused.
     */
    public getActions = (): UserConfig => {
        const actions = this.isPaused ? [] : Array.from(this.active.values());
        return new UserConfig(actions, this.leader, this.leaderTimeout);
    };

    /**
     * Temporarily disables all actions by making `getActions()` return an empty list.
     * Useful when input should be ignored without needing to modify subscriptions.
     */
    public pause = () => {
        this.#isPaused = true;
    };

    /**
     * Re-enables action retrieval — `getActions()` will return subscribed actions again.
     */
    public resume = () => {
        this.#isPaused = false;
    };

    public get isPaused(): boolean {
        return this.#isPaused;
    }
}
