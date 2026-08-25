import { Loader2, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage, profileService } from "@/services/project-match-service";
import type { Skill, SkillLevel, UserProfile } from "@/types/project-match";

const LEVELS: SkillLevel[] = ["beginner", "intermediate", "advanced"];

export function ProfileEditModal({
  open,
  onOpenChange,
  profile,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile;
  onSaved: (next: UserProfile) => void;
}) {
  const [draft, setDraft] = useState(profile);
  const [newSkill, setNewSkill] = useState("");
  const [learn, setLearn] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(profile);
      setError(null);
    }
  }, [open, profile]);

  function patchSkill(id: string, patch: Partial<Skill>) {
    setDraft((d) => ({
      ...d,
      skills: d.skills.map((s) => (s.id === id ? { ...s, ...patch, inferred: false } : s)),
    }));
  }

  function removeSkill(id: string) {
    setDraft((d) => ({ ...d, skills: d.skills.filter((s) => s.id !== id) }));
  }

  function addSkill() {
    const name = newSkill.trim();
    if (!name) return;
    setDraft((d) => ({
      ...d,
      skills: [...d.skills, { id: `new-${Date.now()}`, name, level: "intermediate" }],
    }));
    setNewSkill("");
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const next = await profileService.update(draft);
      onSaved(next);
      toast.success("Profile updated");
      onOpenChange(false);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto bg-surface sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Refine your profile</DialogTitle>
          <DialogDescription>
            We extracted these from your description. Correct anything that's off — matching uses it
            directly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="pm-name">Display name</Label>
            <Input
              id="pm-name"
              value={draft.displayName}
              onChange={(e) => setDraft({ ...draft, displayName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm-desc">Describe yourself</Label>
            <Textarea
              id="pm-desc"
              rows={4}
              value={draft.rawDescription}
              onChange={(e) => setDraft({ ...draft, rawDescription: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              No dropdowns needed — plain sentences work best.
            </p>
          </div>

          <div className="space-y-3">
            <Label>Extracted skills</Label>
            <ul className="space-y-2">
              {draft.skills.map((skill) => (
                <li key={skill.id} className="flex items-center gap-2 rounded-md bg-surface-2 p-2">
                  <span className="flex-1 truncate text-sm">
                    {skill.name}
                    {skill.inferred ? (
                      <Badge variant="outline" className="ml-2 gap-1 text-[10px]">
                        <Sparkles className="size-2.5" aria-hidden="true" />
                        AI guess
                      </Badge>
                    ) : null}
                  </span>
                  <Select
                    value={skill.level}
                    onValueChange={(v) => patchSkill(skill.id, { level: v as SkillLevel })}
                  >
                    <SelectTrigger
                      className="h-8 w-[140px]"
                      aria-label={`Level for ${skill.name}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="min-h-11 min-w-11"
                    aria-label={`Remove ${skill.name}`}
                    onClick={() => removeSkill(skill.id)}
                  >
                    <X className="size-4" aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                placeholder="Add a skill"
                aria-label="Add a skill"
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <Button variant="outline" onClick={addSkill}>
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Want to learn</Label>
            <div className="flex flex-wrap gap-2">
              {draft.wantsToLearn.map((topic) => (
                <Badge key={topic} variant="secondary" className="gap-1">
                  {topic}
                  <button
                    type="button"
                    aria-label={`Remove ${topic}`}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        wantsToLearn: d.wantsToLearn.filter((t) => t !== topic),
                      }))
                    }
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={learn}
                placeholder="e.g. Machine Learning"
                aria-label="Add a topic you want to learn"
                onChange={(e) => setLearn(e.target.value)}
              />
              <Button
                variant="outline"
                onClick={() => {
                  const t = learn.trim();
                  if (!t) return;
                  setDraft((d) => ({ ...d, wantsToLearn: [...d.wantsToLearn, t] }));
                  setLearn("");
                }}
              >
                Add
              </Button>
            </div>
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
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Save profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
