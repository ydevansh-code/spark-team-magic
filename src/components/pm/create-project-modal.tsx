import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { errorMessage, projectService } from "@/services/project-match-service";
import type { Project } from "@/types/project-match";

const ROLE_OPTIONS = [
  "Frontend",
  "Backend",
  "UI/UX Design",
  "Machine Learning",
  "Data Engineering",
  "Mobile",
  "DevOps",
  "Product",
];

export function CreateProjectModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (project: Project) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [size, setSize] = useState(4);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setTitle("");
    setDescription("");
    setRoles([]);
    setSize(4);
    setError(null);
  }

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const project = await projectService.create({
        title,
        description,
        neededRoles: roles,
        teamSizeTarget: size,
      });
      onCreated(project);
      toast.success(`"${project.title}" created`);
      reset();
      onOpenChange(false);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>
            Describe what you're building and which gaps you need filled.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="np-title">Project title</Label>
            <Input
              id="np-title"
              value={title}
              placeholder="Campus hackathon: waste-routing app"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="np-desc">Describe your project</Label>
            <Textarea
              id="np-desc"
              rows={4}
              value={description}
              placeholder="What it does, the stack you're leaning on, the deadline…"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Roles you're looking for</legend>
            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map((role) => {
                const active = roles.includes(role);
                return (
                  <Toggle
                    key={role}
                    pressed={active}
                    onPressedChange={(p) =>
                      setRoles((r) => (p ? [...r, role] : r.filter((x) => x !== role)))
                    }
                    className="h-9 rounded-full border border-border px-3 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    {role}
                  </Toggle>
                );
              })}
            </div>
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="np-size">Target team size: {size}</Label>
            <Slider
              id="np-size"
              min={2}
              max={8}
              step={1}
              value={[size]}
              onValueChange={([v]) => setSize(v)}
            />
          </div>
        </div>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Create project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
