
import  { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  Plus,
  Search,
  Trash2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import type { Agent } from "../interfaces/agent.interface";
import {  toast } from "../shared";
import api from "../lib/api";
import { CgSpinner } from "react-icons/cg";



const Agents = () => {
  const navigate = useNavigate();

  const [agents, setAgents] = useState<Agent[] | null>(null);
  const [search, setSearch] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filteredAgents = agents?.filter((agent) =>
    agent.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this agent? This action cannot be undone.", 
    );

    if (confirmDelete) {
        try {
            setDeleteLoading(true);
            const { data } = await api.delete(`/agent/${id}`);
            toast.add({
                title: "Agent Deleted",
                description: data.message || "The agent has been deleted successfully.",
                type: "success",
            });
            setAgents((prevAgents) => prevAgents?.filter((agent) => agent._id !== id) || null);
        } 
        catch (error) {
            if (error instanceof Error) {
                toast.add({
                    title: "Delete Failed",
                    description:
                        error.message || "An error occurred during deletion. Please try again.",
                    type: "error",
                });
                console.error("Delete Error:", error);
            }
        }
        finally {
            setDeleteLoading(false);
        }
    }
  };

  const handleUseAgent = (agentId: string) => {
    navigate(`/chat?agentId=${agentId}`);
  };

  useEffect(() => {
    const fetchAgents = async () => {
        try {
            const {data} = await api.get("agent");
            console.log("Fetched agents:", data);
            setAgents(data.agents || []);
        } 

        catch (error) {
            console.error("Error fetching agents:", error);
            toast.add({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch agents. Please try again later.",
                type: "error",
            });
        }
    }
    fetchAgents();
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">

      {/* Navbar */}
      <header className="h-16 border-b border-white/6 flex items-center justify-between px-5 sm:px-8 lg:px-12">

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <Bot size={20} className="text-black" />
          </div>
          <span className="font-semibold text-base tracking-tight">
            Automate AI
          </span>
        </div>

        <button
          onClick={() => navigate("/chat")}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors bg-white/4 border border-white/[0.07] rounded-full px-4 py-2"
        >
          <ArrowLeft size={15} />
          Back to chat
        </button>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-12">

        {/* Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">

          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-violet-400 uppercase mb-3">
              <Sparkles size={13} />
              Agent Workspace
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              My Agents
            </h1>

            <p className="text-sm text-zinc-500 mt-2">
              Manage your AI agents and choose one to get started.
            </p>
          </div>

          <button
            onClick={() => navigate("/agents/new")}
            className="flex items-center justify-center gap-2 bg-white text-black rounded-xl px-5 py-3 text-sm font-semibold hover:bg-zinc-200 transition-all shadow-lg shadow-white/5"
          >
            <Plus size={18} />
            Create agent
          </button>

        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">

          <div className="relative w-full sm:max-w-sm">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
            />

            <input
              type="text"
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#17181e] border border-white/[0.07] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>

          <span className="text-xs text-zinc-500">
            {filteredAgents?.length} Agents
          </span>

        </div>

        {/* Agent Cards */}
        {filteredAgents && filteredAgents?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {filteredAgents?.map((agent) => (
              <div
                key={agent._id}
                className="group relative bg-[#17181e] border border-white/[0.07] rounded-2xl p-5 hover:border-violet-500/40 hover:bg-[#1b1c23] transition-all duration-300"
              >

                {/* Card Header */}
                <div className="flex items-center justify-between mb-5">

                  <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center">
                    <Bot size={24} className="text-black" />
                  </div>

                  <button
                    onClick={() => handleDelete(agent._id)}
                    title="Delete agent"
                    className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? <CgSpinner size={17} /> : <Trash2 size={17} />}
                  </button>

                </div>

                {/* Agent Details */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-base font-semibold text-white">
                      {agent.name}
                    </h3>

                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        agent.isActive ? "bg-emerald-400" : "bg-zinc-600"
                      }`}
                    />
                  </div>

                  <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2 min-h-10">
                    {agent.instructions}
                  </p>
                </div>

                {/* Tools */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {agent.tools.map((tool) => (
                    <span
                      key={tool}
                      className="text-[11px] text-zinc-400 bg-white/4 border border-white/4 rounded-md px-2 py-1"
                    >
                      {tool}
                    </span>
                  ))}
                </div>

                {/* Use Agent */}
                <button
                  onClick={() => handleUseAgent(agent._id)}
                  className="w-full flex items-center justify-center gap-2 bg-white/6 hover:bg-violet-600 border border-white/8 hover:border-violet-500 rounded-xl py-2.5 text-sm font-medium text-zinc-200 hover:text-white transition-all duration-200"
                >
                  <Sparkles size={15} />
                  Use Agent
                </button>

              </div>
            ))}

          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-white/10 rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Bot size={28} className="text-zinc-500" />
            </div>

            <h3 className="text-lg font-semibold text-white">
              No agents found
            </h3>

            <p className="text-sm text-zinc-500 mt-2">
              {search
                ? "Try searching with a different name."
                : "Create your first AI agent to get started."}
            </p>

            {!search && (
              <button
                onClick={() => navigate("/agents/new")}
                className="mt-5 flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-lg text-sm font-medium"
              >
                <Plus size={16} />
                Create Agent
              </button>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default Agents;
