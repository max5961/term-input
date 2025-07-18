import { UserConfig } from "./UserConfig.js";
import type { KeyMap, Action } from "../types.js";

export function createActionsWithLeader(
    leader?: Omit<KeyMap, "leader"> | Omit<KeyMap, "leader">[] | string,
    leaderTimeout?: number,
) {
    return (actions: Action[]): UserConfig => {
        return new UserConfig(actions, leader, leaderTimeout);
    };
}

export const createActions = createActionsWithLeader();
