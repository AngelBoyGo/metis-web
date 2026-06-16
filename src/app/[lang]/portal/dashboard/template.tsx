type Props = {
  children: React.ReactNode;
};

/** Forces each dashboard workspace segment to mount with fresh route children. */
export default function DashboardWorkspaceTemplate({ children }: Props) {
  return <>{children}</>;
}
