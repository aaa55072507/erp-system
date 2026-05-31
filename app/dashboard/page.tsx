import Sidebar from "@/components/Sidebar";

export default function Dashboard() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <main style={{ padding: 40 }}>
        <h1>Dashboard 🎉</h1>
        <p>ERP 控制中心</p>
      </main>
    </div>
  );
}