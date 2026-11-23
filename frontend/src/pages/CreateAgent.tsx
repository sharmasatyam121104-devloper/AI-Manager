import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Plus } from "lucide-react";
import axios from "axios";
import api from "../lib/api";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Textarea,
  toast,
} from "../shared";
import type { AgentFormData } from "../interfaces/agent.interface";

const availableTools = [
  {
    id: "calculator",
    name: "Calculator",
    description: "Perform mathematical calculations",
  },
  {
    id: "web.search",
    name: "Web Search",
    description: "Search for information on the web",
  },
  {
    id: "gmail.read",
    name: "Read Emails",
    description: "Read and summarize emails",
  },
  {
    id: "gmail.send",
    name: "Send Emails",
    description: "Draft and send emails",
  },
];

const initialForm: AgentFormData = {
  name: "",
  knowledgeBase: "",
  instructions: "",
  tools: [],
};

type FormErrors = Partial<Record<keyof AgentFormData, string>>;

const CreateAgent = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<AgentFormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const setField = (field: keyof AgentFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleTool = (toolId: string, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      tools: checked
        ? [...prev.tools, toolId]
        : prev.tools.filter((tool) => tool !== toolId),
    }));
    setErrors((prev) => ({ ...prev, tools: undefined }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = "Agent name is required";
    if (!form.knowledgeBase.trim())
      next.knowledgeBase = "Knowledge base is required";
    if (!form.instructions.trim())
      next.instructions = "Instructions are required";
    if (form.tools.length === 0) next.tools = "Select at least one tool";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await api.post("agent", form);
      toast.add({
        title: "Agent Created",
        description: data.message || "Your agent has been created successfully.",
        type: "success",
      });
      navigate("/agents");
    } catch (error) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message ?? error.message
        : error instanceof Error
          ? error.message
          : "Something went wrong";
      toast.add({
        title: "Failed to Create Agent",
        description: message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-white/8 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-5">
          <Button
            variant="outline"
            iconStart={<ArrowLeft size={16} />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <Button
            variant="secondary"
            iconStart={<Home size={16} />}
            onClick={() => navigate("/")}
          >
            Go Home
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-10">
        <Card elevation="raised">
          <CardHeader>
            <CardTitle size="lg" as="h1">
              Create Agent
            </CardTitle>
            <CardDescription>
              Define your agent's identity, knowledge and the tools it can use.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <Input
                label="Agent Name"
                placeholder="e.g. Support Assistant"
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                error={errors.name}
                required
                maxLength={50}
              />

              <Textarea
                label="Knowledge Base"
                placeholder="Paste the information your agent should know..."
                value={form.knowledgeBase}
                onChange={(event) => setField("knowledgeBase", event.target.value)}
                error={errors.knowledgeBase}
                rows={5}
                required
              />

              <Textarea
                label="Instructions"
                placeholder="Describe how your agent should behave and respond..."
                value={form.instructions}
                onChange={(event) => setField("instructions", event.target.value)}
                error={errors.instructions}
                rows={5}
                required
              />

              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Tools <span className="text-destructive">*</span>
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {availableTools.map((tool) => (
                    <Checkbox
                      key={tool.id}
                      label={tool.name}
                      description={tool.description}
                      checked={form.tools.includes(tool.id)}
                      onChange={(event) =>
                        toggleTool(tool.id, event.target.checked)
                      }
                    />
                  ))}
                </div>
                {errors.tools && (
                  <p className="text-sm text-destructive">{errors.tools}</p>
                )}
              </div>

              <div className="flex justify-end border-t border-border pt-5">
                <Button
                  type="submit"
                  loading={loading}
                  iconStart={<Plus size={16} />}
                >
                  Create Agent
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateAgent;
