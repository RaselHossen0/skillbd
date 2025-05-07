"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/AuthProvider";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

interface Expertise {
  id: string | number;
  name: string;
  level: string;
  students_count: number;
}

export default function ExpertisePage() {
  const { user } = useAuth();
  const [expertise, setExpertise] = useState<Expertise[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingExpertise, setIsAddingExpertise] = useState(false);
  const [newExpertise, setNewExpertise] = useState({
    name: "",
    level: "",
  });

  useEffect(() => {
    async function fetchExpertise() {
      try {
        if (user?.role === "MENTOR") {
          const response = await fetch(
            `/api/dashboard/expertise?userId=${user.id}`
          );
          if (!response.ok) throw new Error("Failed to fetch expertise");
          const data = await response.json();
          setExpertise(data.expertise || []);
        }
      } catch (error) {
        console.error("Error fetching expertise:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchExpertise();
  }, [user]);

  const handleAddExpertise = async () => {
    try {
      const response = await fetch("/api/dashboard/expertise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newExpertise,
          userId: user?.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to add expertise");

      const data = await response.json();
      setExpertise([...expertise, data]);
      setIsAddingExpertise(false);
      setNewExpertise({ name: "", level: "" });
    } catch (error) {
      console.error("Error adding expertise:", error);
    }
  };

  const renderExpertise = (item: Expertise) => {
    return (
      <Card key={item.id}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{item.name}</CardTitle>
              <CardDescription>
                <Badge variant="outline" className="mt-2">
                  {item.level}
                </Badge>
              </CardDescription>
            </div>
            <Badge variant="secondary">{item.students_count} Students</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm">
              Edit
            </Button>
            <Button variant="destructive" size="sm">
              Remove
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Expertise Areas</h2>
          <p className="text-muted-foreground">
            Manage your areas of expertise and skill levels
          </p>
        </div>
        <Dialog open={isAddingExpertise} onOpenChange={setIsAddingExpertise}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Expertise
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Expertise</DialogTitle>
              <DialogDescription>
                Add a new area of expertise and your skill level
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Expertise Area</Label>
                <Input
                  id="name"
                  value={newExpertise.name}
                  onChange={(e) =>
                    setNewExpertise({ ...newExpertise, name: e.target.value })
                  }
                  placeholder="e.g., Web Development"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Skill Level</Label>
                <Select
                  value={newExpertise.level}
                  onValueChange={(value) =>
                    setNewExpertise({ ...newExpertise, level: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                    <SelectItem value="EXPERT">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsAddingExpertise(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddExpertise}>Add Expertise</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {expertise.length > 0 ? (
          expertise.map((item) => renderExpertise(item))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">
                No expertise areas added yet
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsAddingExpertise(true)}
              >
                Add Your First Expertise
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
