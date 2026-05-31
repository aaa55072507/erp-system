import Link from "next/link";

export default function Sidebar() {
  return (
    <div style={styles.sidebar}>
      <h2 style={{ marginBottom: 20 }}>ERP 系統</h2>

      <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Link href="/dashboard">📊 Dashboard</Link>
        <Link href="/members">👤 會員管理</Link>
        <Link href="/bookings">📅 預約管理</Link>
        <Link href="/venues">🏟 場館管理</Link>
        <Link href="/products">📦 商品管理</Link>
      </nav>
    </div>
  );
}

const styles = {
  sidebar: {
    width: 200,
    height: "100vh",
    padding: 20,
    borderRight: "1px solid #ddd",
  },
};