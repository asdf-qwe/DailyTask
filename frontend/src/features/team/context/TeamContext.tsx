"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/src/features/auth/context/AuthContext";
import { teamService } from "@/src/features/team/service/teamService";

export interface TeamSummary {
  teamId: number;
  name: string;
  memberCount: number;
}

interface TeamContextValue {
  teams: TeamSummary[];
  isLoadingTeams: boolean;
  refreshTeams: () => Promise<void>;
}

const TeamContext = createContext<TeamContextValue | undefined>(undefined);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);

  const refreshTeams = useCallback(async () => {
    if (!isAuthenticated) {
      setTeams([]);
      return;
    }

    setIsLoadingTeams(true);
    try {
      const response = await teamService.getTeam();
      if (response.success) {
        setTeams(
          response.data.map((team) => ({
            teamId: team.teamId,
            name: team.name,
            memberCount: team.memberCount ?? 0,
          })),
        );
      }
    } catch {
      setTeams([]);
    } finally {
      setIsLoadingTeams(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshTeams();
  }, [refreshTeams]);

  const value = useMemo(
    () => ({ teams, isLoadingTeams, refreshTeams }),
    [teams, isLoadingTeams, refreshTeams],
  );

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error("useTeam must be used within a TeamProvider");
  }
  return context;
}
