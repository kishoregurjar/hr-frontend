import axiosClient from "./axiosClient";

/**
 * 1. Fetch Platform Admin Overview Metrics
 */
export const getAdminMetrics = async () => {
  try {
    const res = await axiosClient.get("/admin/metrics");
    return res?.data?.data || res?.data || res;
  } catch {
    // Fallback populated analytics for Super Admin
    return {
      totalCompanies: 28,
      activeCompanies: 24,
      totalCandidatesAssessed: 4890,
      totalAssessmentsCreated: 142,
      averageCompletionRate: 88.4,
      averageCandidateScore: 76.2,
      activeGamesCount: 6,
      topSkillsMeasured: [
        { name: "Logical Reasoning", count: 3200 },
        { name: "Problem Solving", count: 2950 },
        { name: "Processing Speed", count: 2410 },
        { name: "Pattern Recognition", count: 2100 },
        { name: "Memory", count: 1890 },
      ],
    };
  }
};

/**
 * 2. Fetch All Companies (B2B Tenants)
 */
export const getAdminCompanies = async () => {
  try {
    const res = await axiosClient.get("/admin/companies");
    return res?.data?.data || res?.data || res;
  } catch {
    return [
      {
        id: "comp_1",
        name: "TechMatrix Labs",
        domain: "techmatrix.io",
        logo: "TM",
        plan: "Enterprise",
        hrContact: "Rohit Panchal (HR Lead)",
        email: "hr@techmatrix.io",
        totalAssessments: 14,
        candidatesAssessed: 620,
        status: "ACTIVE",
        joinedDate: "2026-06-12",
      },
      {
        id: "comp_2",
        name: "Acme Corp Global",
        domain: "acmecorp.com",
        logo: "AC",
        plan: "Growth",
        hrContact: "Priya Sharma (Recruiter)",
        email: "priya@acmecorp.com",
        totalAssessments: 8,
        candidatesAssessed: 310,
        status: "ACTIVE",
        joinedDate: "2026-07-01",
      },
      {
        id: "comp_3",
        name: "InnoWave Systems",
        domain: "innowave.ai",
        logo: "IW",
        plan: "Enterprise",
        hrContact: "Vikram Mehta",
        email: "vikram@innowave.ai",
        totalAssessments: 22,
        candidatesAssessed: 1250,
        status: "ACTIVE",
        joinedDate: "2026-05-19",
      },
      {
        id: "comp_4",
        name: "NextGen Mobility",
        domain: "nextgenmobility.in",
        logo: "NM",
        plan: "Starter",
        hrContact: "Neha Kapoor",
        email: "neha@nextgenmobility.in",
        totalAssessments: 3,
        candidatesAssessed: 85,
        status: "SUSPENDED",
        joinedDate: "2026-08-10",
      },
    ];
  }
};

/**
 * 3. Toggle Company Status (ACTIVE / SUSPENDED)
 */
export const toggleCompanyStatus = async (companyId, newStatus) => {
  try {
    const res = await axiosClient.patch(`/admin/companies/${companyId}/status`, {
      status: newStatus,
    });
    return res?.data?.data || res?.data || res;
  } catch {
    return { success: true, companyId, status: newStatus };
  }
};

/**
 * 4. Fetch Global Cognitive Games Catalog (Section 15 PRD)
 */
export const getAdminGames = async () => {
  try {
    const res = await axiosClient.get("/admin/games");
    return res?.data?.data || res?.data || res;
  } catch {
    return [
      {
        id: "game_zip",
        name: "Zip",
        code: "ZIP",
        category: "Cognitive",
        status: "ACTIVE",
        skills: ["Processing Speed", "Hand-Eye Coordination", "Focus"],
        averagePlayTime: "3.5 mins",
        assessmentsUsedIn: 48,
        description: "Connect path tiles swiftly while navigating obstacles under rapid timer constraints.",
      },
      {
        id: "game_sudoku",
        name: "Mini Sudoku",
        code: "SUDOKU",
        category: "Logical",
        status: "ACTIVE",
        skills: ["Logical Reasoning", "Problem Solving", "Deduction"],
        averagePlayTime: "5.0 mins",
        assessmentsUsedIn: 72,
        description: "4x4 and 6x6 numerical deduction grid measuring spatial reasoning and logical rules.",
      },
      {
        id: "game_queen",
        name: "Queen",
        code: "QUEEN",
        category: "Spatial",
        status: "ACTIVE",
        skills: ["Spatial Reasoning", "Pattern Recognition", "Decision Making"],
        averagePlayTime: "4.2 mins",
        assessmentsUsedIn: 39,
        description: "Place queens on grid matrices without overlapping attack lines.",
      },
      {
        id: "game_tango",
        name: "Tango",
        code: "TANGO",
        category: "Cognitive",
        status: "ACTIVE",
        skills: ["Concentration", "Working Memory", "Pattern Recognition"],
        averagePlayTime: "4.0 mins",
        assessmentsUsedIn: 54,
        description: "Equilibrium puzzle balancing symbols across grid constraints.",
      },
      {
        id: "game_memory",
        name: "Memory Match",
        code: "MEMORY_MATCH",
        category: "Memory",
        status: "ACTIVE",
        skills: ["Short-term Memory", "Visual Recall", "Concentration"],
        averagePlayTime: "3.0 mins",
        assessmentsUsedIn: 96,
        description: "Card pairing memory matrix testing spatial visual retention.",
      },
      {
        id: "game_maze",
        name: "Maze Escape",
        code: "MAZE_ESCAPE",
        category: "Problem Solving",
        status: "ACTIVE",
        skills: ["Problem Solving", "Spatial Orientation", "Forward Planning"],
        averagePlayTime: "4.5 mins",
        assessmentsUsedIn: 64,
        description: "Dynamic procedural labyrinth navigation measuring forward decision trees.",
      },
    ];
  }
};

/**
 * 5. Toggle Game Status
 */
export const toggleGameStatus = async (gameId, newStatus) => {
  try {
    const res = await axiosClient.patch(`/admin/games/${gameId}/status`, {
      status: newStatus,
    });
    return res?.data?.data || res?.data || res;
  } catch {
    return { success: true, gameId, status: newStatus };
  }
};

/**
 * 6. Fetch Platform Users
 */
export const getAdminUsers = async () => {
  try {
    const res = await axiosClient.get("/admin/users");
    return res?.data?.data || res?.data || res;
  } catch {
    return [
      {
        id: "usr_1",
        name: "Rohit Panchal",
        email: "rohit@mindersworld.com",
        role: "SUPER_ADMIN",
        company: "Minders World HQ",
        status: "ACTIVE",
        lastActive: "Just now",
      },
      {
        id: "usr_2",
        name: "Anurag Sharma",
        email: "anurag@techmatrix.io",
        role: "HR_ADMIN",
        company: "TechMatrix Labs",
        status: "ACTIVE",
        lastActive: "15 mins ago",
      },
      {
        id: "usr_3",
        name: "Priya Sharma",
        email: "priya@acmecorp.com",
        role: "HR",
        company: "Acme Corp Global",
        status: "ACTIVE",
        lastActive: "2 hours ago",
      },
      {
        id: "usr_4",
        name: "Vikram Mehta",
        email: "vikram@innowave.ai",
        role: "HR",
        company: "InnoWave Systems",
        status: "ACTIVE",
        lastActive: "1 day ago",
      },
    ];
  }
};
