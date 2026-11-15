import React, { useEffect, useRef, useState, useMemo } from "react";
import OfficerCards from "../components/officer/cards";
import Popup from "../components/officer/card-popup";
import { supabase } from "../supabaseClient";
import { Officer } from "../types";
import { useSiteContent } from "../hooks/useSiteContent";
import {
  teamMembers as default2025Members,
  teamMembers2024 as default2024Members,
  convertTeamMemberToOfficer,
  getOfficerTeam,
  TEAM_DIVISIONS,
} from "../data/team_members";

function getImageSrc(url: string): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return process.env.PUBLIC_URL + url;
}

type AcademicYear = "2025-2026" | "2024-2025";

interface TeamGroup {
  teamName: string;
  icon: string;
  description: string;
  officers: Officer[];
}

const TeamPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dbOfficers, setDbOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Officer | null>(null);
  const [activeYear, setActiveYear] = useState<AcademicYear>("2025-2026");
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>("all");

  const content = useSiteContent(
    ["team_banner_url", "team_heading_white", "team_heading_red"],
    {
      team_banner_url: "/officers/teambg2024.png",
      team_heading_white: "Meet",
      team_heading_red: "Our Officers",
    }
  );

  // Fetch officers from Supabase
  useEffect(() => {
    let isMounted = true;
    async function fetchOfficers() {
      try {
        const { data, error } = await supabase
          .from("officers")
          .select("*")
          .order("display_order", { ascending: true });

        if (isMounted) {
          if (!error && data && data.length > 0) {
            setDbOfficers(data);
          }
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchOfficers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute active officers based on chosen academic year
  const currentOfficers = useMemo<Officer[]>(() => {
    if (activeYear === "2025-2026") {
      // 1. Build map of static 2025/2026 elected officers
      const baseOfficers = default2025Members.map((m, idx) =>
        convertTeamMemberToOfficer(m, idx)
      );

      // 2. Layer in any updates or uploads from Supabase matching these names
      if (dbOfficers.length > 0) {
        return baseOfficers.map((staticOff) => {
          const match = dbOfficers.find(
            (db) => db.name.toLowerCase().trim() === staticOff.name.toLowerCase().trim()
          );
          if (match) {
            return {
              ...staticOff,
              ...match,
              team: match.team || staticOff.team,
              image_url: match.image_url || staticOff.image_url,
              fun_image_url: match.fun_image_url || staticOff.fun_image_url,
              bio: match.bio || staticOff.bio,
            };
          }
          return staticOff;
        });
      }
      return baseOfficers;
    } else {
      // 2024-2025 Previous Board
      const baseOfficers = default2024Members.map((m, idx) =>
        convertTeamMemberToOfficer(m, idx)
      );

      if (dbOfficers.length > 0) {
        return baseOfficers.map((staticOff) => {
          const match = dbOfficers.find(
            (db) => db.name.toLowerCase().trim() === staticOff.name.toLowerCase().trim()
          );
          if (match) {
            return {
              ...staticOff,
              ...match,
              team: match.team || staticOff.team,
              image_url: match.image_url || staticOff.image_url,
              fun_image_url: match.fun_image_url || staticOff.fun_image_url,
              bio: match.bio || staticOff.bio,
            };
          }
          return staticOff;
        });
      }
      return baseOfficers;
    }
  }, [activeYear, dbOfficers]);

  // Group officers by team division in canonical order
  const groupedTeams = useMemo<TeamGroup[]>(() => {
    const map = new Map<string, Officer[]>();

    currentOfficers.forEach((officer) => {
      const teamName = getOfficerTeam(officer.role, officer.team);
      if (!map.has(teamName)) {
        map.set(teamName, []);
      }
      map.get(teamName)!.push({
        ...officer,
        team: teamName,
      });
    });

    const groups: TeamGroup[] = [];

    // Prioritize predefined canonical division order
    TEAM_DIVISIONS.forEach((div) => {
      const officersInTeam = map.get(div.name);
      if (officersInTeam && officersInTeam.length > 0) {
        groups.push({
          teamName: div.name,
          icon: div.icon,
          description: div.description,
          officers: officersInTeam,
        });
        map.delete(div.name);
      }
    });

    // Add any remaining teams
    map.forEach((officersInTeam, teamName) => {
      if (officersInTeam.length > 0) {
        groups.push({
          teamName,
          icon: "⭐",
          description: "Dedicated officers advancing PERMIAS UIUC community programs.",
          officers: officersInTeam,
        });
      }
    });

    return groups;
  }, [currentOfficers]);

  // Filtered groups if a specific team filter pill is selected
  const displayedGroups = useMemo(() => {
    if (selectedTeamFilter === "all") return groupedTeams;
    return groupedTeams.filter(
      (g) => g.teamName.toLowerCase() === selectedTeamFilter.toLowerCase()
    );
  }, [groupedTeams, selectedTeamFilter]);

  // Fade-in observer on cards
  useEffect(() => {
    if (loading || displayedGroups.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fadeIn");
          }
        });
      },
      { rootMargin: "0px", threshold: 0.1 }
    );

    const cards = containerRef.current?.querySelectorAll(".officer-card");
    cards?.forEach((card) => observer.observe(card));
    return () => cards?.forEach((card) => observer.unobserve(card));
  }, [loading, displayedGroups, activeYear]);

  return (
    <div className="mb-[90px] min-h-screen bg-ground" ref={containerRef}>
      {/* Hero Banner with Dark Contrast Overlay */}
      <div className="relative w-full h-[320px] md:h-[550px] overflow-hidden bg-footer">
        <img
          src={getImageSrc(content.team_banner_url)}
          alt="PERMIAS UIUC Board"
          className="object-cover w-full h-full opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end items-center pb-10 px-4 text-center">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-red text-white shadow-md mb-3">
            PERMIAS UIUC Leadership
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            {content.team_heading_white}{" "}
            <span className="text-red">{content.team_heading_red}</span>
          </h1>
          <p className="max-w-2xl text-sm md:text-base text-gray-200 mt-2 font-medium">
            Meet the Indonesian Student Club executive board and committees uniting students and promoting Indonesian culture at UIUC.
          </p>
        </div>
      </div>

      {/* Control Center: Academic Year Switcher & Team Filter Pills */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-gray-200">
          {/* Year Switcher */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
              Select Academic Board
            </span>
            <div className="inline-flex p-1 bg-gray-100 rounded-xl border border-gray-200 shadow-inner">
              <button
                onClick={() => {
                  setActiveYear("2025-2026");
                  setSelectedTeamFilter("all");
                }}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  activeYear === "2025-2026"
                    ? "bg-red text-white shadow-md"
                    : "text-gray-600 hover:text-footer"
                }`}
              >
                2025–2026 Board (Current)
              </button>
              <button
                onClick={() => {
                  setActiveYear("2024-2025");
                  setSelectedTeamFilter("all");
                }}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  activeYear === "2024-2025"
                    ? "bg-red text-white shadow-md"
                    : "text-gray-600 hover:text-footer"
                }`}
              >
                2024–2025 Board (Previous)
              </button>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 text-sm text-gray-600 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm self-start md:self-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              Showing <strong className="text-footer">{currentOfficers.length}</strong> officers across{" "}
              <strong className="text-footer">{groupedTeams.length}</strong> teams
            </span>
          </div>
        </div>

        {/* Team Navigation Filter Pills */}
        <div className="mt-6 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">
            Jump to Team:
          </span>
          <button
            onClick={() => setSelectedTeamFilter("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedTeamFilter === "all"
                ? "bg-footer text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-700 hover:border-gray-400"
            }`}
          >
            All Teams ({currentOfficers.length})
          </button>
          {groupedTeams.map((group) => (
            <button
              key={group.teamName}
              onClick={() => setSelectedTeamFilter(group.teamName)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedTeamFilter.toLowerCase() === group.teamName.toLowerCase()
                  ? "bg-red text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-gray-400"
              }`}
            >
              <span>{group.icon}</span>
              <span>{group.teamName}</span>
              <span className="opacity-75 font-normal">({group.officers.length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Grouped Teams and Officer Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 text-gray-400 space-y-3">
            <div className="w-10 h-10 border-4 border-red border-t-transparent rounded-full animate-spin"></div>
            <span className="text-base font-medium">Loading PERMIAS officers...</span>
          </div>
        ) : displayedGroups.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No officers found for this filter.</p>
            <button
              onClick={() => setSelectedTeamFilter("all")}
              className="mt-3 text-red font-semibold hover:underline"
            >
              View All Teams
            </button>
          </div>
        ) : (
          displayedGroups.map((group) => (
            <section
              key={group.teamName}
              id={`team-${group.teamName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              className="scroll-mt-28"
            >
              {/* Team Group Header Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-md mb-10 transition hover:shadow-lg">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Title, Icon, Badge & Description */}
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl" role="img" aria-label={group.teamName}>
                        {group.icon}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-footer tracking-tight">
                        {group.teamName}
                      </h2>
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-red/10 text-red border border-red/20">
                        {group.officers.length} {group.officers.length === 1 ? "Officer" : "Officers"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      {group.description}
                    </p>
                  </div>

                  {/* Right: Prominent Names Roster ("And put all their names on there") */}
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 lg:max-w-md w-full">
                    <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-footer">
                      <span className="text-red">👥</span> Team Roster ({group.officers.length} Members)
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {group.officers.map((officer) => (
                        <button
                          key={officer.id}
                          onClick={() => setSelectedMember(officer)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-footer hover:border-red hover:text-red transition shadow-xs flex items-center gap-1.5"
                          title={`Click to view ${officer.name}'s bio`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-red"></span>
                          <span>{officer.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid of Officer Picture Cards for this Team */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
                {group.officers.map((member) => (
                  <div key={member.id} className="w-full flex justify-center">
                    <OfficerCards
                      member={member}
                      className="opacity-0 officer-card w-full"
                      onClick={() => setSelectedMember(member)}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Interactive Modal Popup for Selected Officer */}
      {selectedMember && (
        <Popup
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          member={selectedMember}
        />
      )}
    </div>
  );
};

export default TeamPage;
