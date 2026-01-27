import LogoutButton from "../auth/LogoutButton";

export default function Topbar() {
  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6">
      <h1 className="font-semibold">Dashboard</h1>
      <div className="flex items-center gap-2"></div>
      <LogoutButton />
    </header>
  );
}
