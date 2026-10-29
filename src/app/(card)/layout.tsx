import RootHtml from "@/components/layout/RootHtml";

export const metadata = {
  title: "GENEVITY Friends",
  robots: "noindex, nofollow",
};

export default function CardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootHtml lang="uk" chrome={false}>
      <div className="font-body">{children}</div>
    </RootHtml>
  );
}
