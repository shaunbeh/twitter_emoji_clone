import type { GetStaticProps, NextPage, GetStaticPaths } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { appRouter } from "~/server/api/root";

const proPicSize = 128;

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profiles.getUserByUsername.useQuery({
    username,
  });

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <>
          <div className="relative h-36  bg-slate-600">
            <Image
              src={data.profileImageUrl}
              alt={`${data.username ?? ""}'s profile picture`}
              width={proPicSize}
              height={proPicSize}
              className="absolute bottom-0 left-0 -mb-16 ml-4 rounded-full border-4 border-black"
            />
          </div>
          <div className="h-16" />
          <div className="p-4">
            <div className="font-2xl font-bold">{`@${
              data.username ?? ""
            }`}</div>
          </div>
          <div className="border-b border-slate-400/20" />
        </>
      </PageLayout>
    </>
  );
};
export default ProfilePage;

import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { prisma } from "~/server/db";
import superjson from "superjson";
import PageLayout from "~/components/layout";
import Image from "next/image";

export const getStaticProps: GetStaticProps = async (ctx) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
  });
  const slug = ctx.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");
  const username = slug.replace("@", "");

  await ssg.profiles.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};
