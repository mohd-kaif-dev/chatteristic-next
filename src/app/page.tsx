import { getPosts } from "@/actions/post.action";
import { getDbUserId } from "@/actions/user.action";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import WhoToFollow from "@/components/WhoToFollow";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();
  const posts = (await getPosts()) || [];

  const dbUserId = (await getDbUserId()) || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-6">
        {user ? <CreatePost /> : null}

        <div className="space-y-6 border-t pt-6">
          {posts.length > 0 ? (
            posts.map((post: any) => (
              <PostCard key={post.id} post={post} dbUserId={dbUserId} />
            ))
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              No posts yet. Create one.
            </p>
          )}
        </div>
      </div>

      <div className="hidden lg:block lg:col-span-4 sticky top-20">
        <WhoToFollow />
      </div>
    </div>
  );
}
