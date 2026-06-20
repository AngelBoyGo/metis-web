type Props = {
  children: React.ReactNode;
};

/** Forces each dashboard workspace segment to mount with fresh route children. */
export default function DashboardWorkspaceTemplate({ children }: Props) {
  return (
    <div
      key="dashboard-workspace-template"
      data-dashboard-template="route-remount"
      style={{ display: "contents" }}
    >
      {children}
    </div>
  );
}
