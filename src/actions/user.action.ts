'use server';

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function syncUser() {
    try {
    const {userId} = await auth()
    const user = await currentUser();

    if(!userId || !user) return;

    // Check if the user already exists in the database
    const existingUser = await prisma.user.findUnique({
        where: {
            clerkId: userId
        }
    })

    if(existingUser) return existingUser;

    const dbUser = await prisma.user.create({
        data: {
            clerkId: userId,
            name: `${user.firstName || ""} ${user.lastName || ""}`,
            username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
            image: user.imageUrl,
            email: user.emailAddresses[0].emailAddress
        }
    })

    return dbUser;
        
    } catch (error) {
        console.log("Error syncing user:", error);
        
    }
}

export async function getUserByClerkId(clerkId: string) {
    try {
        return await prisma.user.findUnique({
            where: {
                clerkId: clerkId
            },
            include: {
                _count: {
                    select: {
                        followers:true,
                        following: true,
                        posts: true
                    }
                }
            }
        })
    } catch (error) {
        console.log("Error finding user by clerkId:", error);
        
    }
}

export async function getRandomUsers() {
    try {
        const userId = await getDbUserId()
        if(!userId) {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true,
                    _count: {
                        select: {
                            followers: true,
                        }
                    }
                },
                take: 3,
            });
            return users;
        }
           
        const following = await prisma.follows.findMany({
            where: {
                followingId: userId
            }
        })
        const users = await prisma.user.findMany({
            where: {
                AND: [
                    {
                        NOT: {
                            id: userId
                        }
                    },
                    {
                        NOT: {
                            followers: {
                                some: {
                                    followerId: {
                                        in: following.map(follow => follow.followerId)
                                    }
                                }
                            }
                        }
                    }
                ]
            },
           select: {
            id: true,
            name: true,
            username: true,
            image: true,
            _count: {
                select: {
                    followers: true,
                }
            }
           },
           take: 3,
        });
        return users;
    } catch (error) {
        console.log("Error fetching random users:", error);
        return []
    }
}

export async function toggleFollow(targetUserId: string) {
    try {
        const userId = await getDbUserId();
        if(!userId) return;
        if(!targetUserId) return new Error("User to follow ID is undefined");
        if(userId === targetUserId) return new Error("You can't follow yourself");
       

        const isFollowing = await prisma.follows.findUnique({
            where: {
                followerId_followingId: {
                    followerId: targetUserId,
                    followingId: userId
                }
            }
        })

        if(isFollowing) {
            // unfollow
            await prisma.follows.delete({
                where: {
                    followerId_followingId: {
                        followerId: targetUserId,
                        followingId: userId
                    }
                }
            })
            revalidatePath("/")
        return { success: true, message: "User unfollowed successfully" };
        } else {
            // follow - we are using transaction to ensure that both the follows and notifications are created at the same time if one fails the other should not be created
            await prisma.$transaction([
                prisma.follows.create({
                    data: {
                        followerId: targetUserId,
                        followingId: userId
                    }
                }),

                prisma.notification.create({
                    data: {
                        type: "FOLLOW",
                        userId: targetUserId, // user being followed
                        creatorId: userId // user who is following
                    }
                })
            ])

            revalidatePath("/")
            return { success: true, message: "User followed successfully" };
        }
        
    } catch (error) {
        console.log("Error toggling follow:", error);
        return { success: false, error: "Failed to toggle follow" };
    }
}

export async function getDbUserId () {  // helper function
    try {
        const {userId: clerkId} = await auth()
        if(!clerkId) return null;
        const user = await getUserByClerkId(clerkId)

        if(!user) throw new Error("User Not Found");
           
        return user?.id
    } catch (error) {
        console.log("Error getting db user id:", error);
        
    }
}

export async function getUsersBySearch(search: string) {
    try {
        return await prisma.user.findMany({
            where: {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: "insensitive"
                        }
                    },
                    {
                        username: {
                            contains: search,
                            mode: "insensitive"
                        }
                    }
                ]
            }
        } )
    } catch (error) {
        console.log("Error getting user by search:", error);
        
    }
}
