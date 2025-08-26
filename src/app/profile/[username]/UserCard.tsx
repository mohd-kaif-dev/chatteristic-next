import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isFollowing } from "@/actions/profile.action";
import { toggleFollow } from "@/actions/user.action";
import { Loader2Icon } from "lucide-react";

type User = {
  id: string;
  name: string;
  username: string;
  image: string;
};

type UserCardProps = {
  user: User;
};

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const handleFollow = async () => {
    if (isUpdatingFollow) return;
    try {
      setIsUpdatingFollow(true);
      await toggleFollow(user.id);
    } catch (error) {
      console.error("Error following user:", error);
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const isFollowingUser = await isFollowing(user.id);
        setIsFollowingUser(isFollowingUser);
      } catch (error) {
        console.error("Error checking follow status:", error);
      } finally {
        setIsFetching(false);
      }
    })();
  }, [isFollowingUser, user.id]);

  if (!user) return null;
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      <Link href={`/profile/${user.username}`}>
        <img
          src={user.image || "/avatar.png"}
          alt={user.name}
          className="w-12 h-12 rounded-full object-cover cursor-pointer"
        />
      </Link>
      <div className="flex-1">
        <Link
          href={`/profile/${user.username}`}
          className="no-underline text-inherit"
        >
          <div className="font-bold">{user.name}</div>
        </Link>
        <div className="text-gray-500">@{user.username}</div>
      </div>
      <Button
        className="ml-auto"
        onClick={handleFollow}
        disabled={isUpdatingFollow}
        variant={isFollowingUser ? "outline" : "default"}
      >
        {isUpdatingFollow || isFetching ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : isFollowingUser ? (
          "Following"
        ) : (
          "Follow"
        )}
      </Button>
    </div>
  );
};

export default UserCard;
