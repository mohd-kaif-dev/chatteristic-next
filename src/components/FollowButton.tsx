"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";
import toast from "react-hot-toast";
import { getDbUserId, toggleFollow } from "@/actions/user.action";

function FollowButton({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    if (!userId) return toast.error("User ID is undefined");
    const loggedInUser = await getDbUserId();
    if (!loggedInUser) return toast.error("You need to log in to follow users");
    setIsLoading(true);
    try {
      const result = await toggleFollow(userId);
      if (result instanceof Error) {
        toast.error(result.message);
      } else if (result?.success && result.message) {
        toast.success(result.message);
      } else if (!result?.success && result?.error) {
        toast.error(result?.error);
      }
    } catch (error) {
      toast.error("Error following user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size={"sm"}
      variant={"secondary"}
      onClick={handleFollow}
      disabled={isLoading}
      className="w-20"
    >
      {isLoading ? <Loader2Icon className="size-4 animate-spin" /> : "Follow"}
    </Button>
  );
}
export default FollowButton;
