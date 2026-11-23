import {
  ChevronDown,
  Plus,
  LayoutDashboard,
  Plug,
  LogOut,
  Sparkles,
} from "lucide-react";
import {
  Avatar,
  Button,
  Dropdown,
  DropdownHeader,
  DropdownItem,
  DropdownSeparator,
  toast,
} from "../shared";
import { useEffect, useState } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router";
import type { UserInterface } from "../interfaces/user.interface";


const Home = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [me, setMe] = useState<UserInterface | null>(null);

  const handleLogout = async () => {
    try {
        setLoading(true);
        const {data} = await api.get("auth/logout");
        toast.add({
            title: "Logout Successful",
            description: data.message || "You have been logged out successfully.",
            type: "success",
        });
        navigate("/login");
    } 
    catch (error) {
        if (error instanceof Error) {
            toast.add({
                title: "Logout Failed",
                description:
                    error.message || "An error occurred during logout. Please try again.",
                type: "error",
            });
            console.error("Logout Error:", error);
        }
    }
    finally {
        setLoading(false);
    }
  };

  const handleMyAgents = () => {
    console.log("My Agents clicked");
  };

  const handleCreateAgent = () => {
    console.log("Create New Agent clicked");
  };

  const handleIntegrations = () => {
    toast.add({
      title: "Coming Soon",
      description: "Integrations feature is coming soon!",
      type: "info",
    });
  };

    useEffect(() => {
    const fetchMyData = async () => {
        try {
        const { data } = await api.get("auth/me");
        setMe(data.user);
        console.log("Fetched User Data:", data);
        } catch (error) {
        toast.add({
            title: "Error Fetching User Data",
            description:
            error instanceof Error
                ? error.message
                : "An error occurred while fetching user data.",
            type: "error",
        });

        console.error("Fetch User Data Error:", error);
        }
    };

    fetchMyData();
    }, []);

  const triggerLabelClass = "hidden text-sm text-zinc-300 sm:inline";
  const chevronClass = "text-zinc-500";

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/8 bg-black/80 backdrop-blur-xl">
        <div className="mx-10 flex h-16 items-center justify-between px-5 sm:px-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black">
              <Sparkles size={21} strokeWidth={2.2} />
            </div>

            <span className="text-lg font-semibold tracking-tight">
              Automata
              <span className="text-zinc-500"> AI</span>
            </span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Agents Dropdown */}
            <Dropdown
              align="end"
              label="AGENT WORKSPACE"
              trigger={(triggerProps) => (
                <Button variant="outline" {...triggerProps}>
                  <Avatar name={me?.fullname} size="sm" />
                  <span className={triggerLabelClass}>Agents</span>
                  <ChevronDown size={14} className={chevronClass} />
                </Button>
              )}
            >
              <DropdownItem
                icon={<LayoutDashboard size={17} />}
                onSelect={handleMyAgents}
              >
                My Agents
              </DropdownItem>

              <DropdownItem
                icon={<Plus size={17} />}
                onSelect={handleCreateAgent}
              >
                Create New Agent
              </DropdownItem>

              <DropdownSeparator />

              <DropdownItem
                icon={<Plug size={17} />}
                onSelect={handleIntegrations}
              >
                Integrations
              </DropdownItem>
            </Dropdown>

            {/* Profile Dropdown */}
            <Dropdown
              align="end"
              menuWidth="16rem"
              trigger={(triggerProps) => (
                <Button variant="outline" shape="pill" {...triggerProps}>
                  <Avatar name={me?.fullname} size="sm" />
                  <span className={triggerLabelClass}>Account</span>
                  <ChevronDown size={14} className={chevronClass} />
                </Button>
              )}
            >
              <DropdownHeader>
                <Avatar name={me?.fullname} size="lg" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {me?.fullname}
                  </p>
                  <p className="truncate text-xs font-normal text-zinc-500">
                    {me?.email}
                  </p>
                </div>
              </DropdownHeader>

              <DropdownSeparator />

              <DropdownItem
                icon={<LogOut size={17}  />}
                tone="danger"
                disabled={loading}
                onSelect={handleLogout}
              >
                {loading ? "Logging out..." : "Logout"}
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        {/* Your homepage content goes here */}
      </main>
    </div>
  );
};

export default Home;
